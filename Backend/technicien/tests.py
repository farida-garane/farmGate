from datetime import date

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from agriculteur.models import Campagne, Depense, Parcelle

from .models import Recommandation

User = get_user_model()


class ConseillerTests(APITestCase):

    def setUp(self):
        self.conseiller = User.objects.create_user('conseiller', password='x', role=User.Role.CONSEILLER)
        self.agri = User.objects.create_user('awa', password='x', localisation='Koudougou')
        self.autre = User.objects.create_user('ali', password='x')
        parcelle = Parcelle.objects.create(agriculteur=self.agri, nom='Champ nord', superficie=2)
        self.campagne = Campagne.objects.create(
            parcelle=parcelle, culture='Maïs', date_debut=date(2026, 6, 1)
        )
        Depense.objects.create(campagne=self.campagne, categorie='SEMENCES',
                               montant=25000, date=date(2026, 6, 1))
        self.client.force_authenticate(self.conseiller)

    def test_liste_des_agriculteurs(self):
        response = self.client.get(reverse('technicien:agriculteur-list'),
                                   {'localisation': 'koudougou'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual([a['username'] for a in response.data], ['awa'])
        self.assertEqual(response.data[0]['nb_parcelles'], 1)

    def test_consulte_les_campagnes_avec_details(self):
        response = self.client.get(reverse('technicien:campagne-list'),
                                   {'agriculteur': self.agri.pk})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data[0]['total_depenses'], 25000)
        self.assertEqual(len(response.data[0]['depenses']), 1)

    def test_ne_peut_pas_modifier_les_campagnes(self):
        response = self.client.delete(reverse('technicien:campagne-detail', args=[self.campagne.pk]))
        self.assertEqual(response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED)

    def test_envoie_une_recommandation_preventive(self):
        response = self.client.post(reverse('technicien:recommandation-list'), {
            'agriculteur': self.agri.pk,
            'campagne': self.campagne.pk,
            'type': 'PREVENTION',
            'titre': 'Risque de chenille légionnaire',
            'message': 'Surveillez les feuilles de maïs cette semaine.',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Recommandation.objects.get().conseiller, self.conseiller)

    def test_campagne_d_un_autre_agriculteur_refusee(self):
        response = self.client.post(reverse('technicien:recommandation-list'), {
            'agriculteur': self.autre.pk,
            'campagne': self.campagne.pk,
            'type': 'ACCOMPAGNEMENT',
            'titre': 'Suivi',
            'message': '...',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_agriculteur_n_a_pas_acces_aux_routes_conseiller(self):
        self.client.force_authenticate(self.agri)
        response = self.client.get(reverse('technicien:agriculteur-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class MesRecommandationsTests(APITestCase):

    def setUp(self):
        conseiller = User.objects.create_user('conseiller', password='x', role=User.Role.CONSEILLER)
        self.agri = User.objects.create_user('awa', password='x')
        autre = User.objects.create_user('ali', password='x')
        self.reco = Recommandation.objects.create(
            conseiller=conseiller, agriculteur=self.agri,
            type='ACCOMPAGNEMENT', titre='Bon semis', message='...',
        )
        Recommandation.objects.create(
            conseiller=conseiller, agriculteur=autre,
            type='ANALYSE', titre='Pour Ali', message='...',
        )
        self.client.force_authenticate(self.agri)

    def test_agriculteur_voit_ses_recommandations(self):
        response = self.client.get(reverse('technicien:mes-recommandation-list'))
        self.assertEqual([r['titre'] for r in response.data], ['Bon semis'])

    def test_marquer_comme_lue(self):
        response = self.client.post(reverse('technicien:mes-recommandation-lire', args=[self.reco.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.reco.refresh_from_db()
        self.assertTrue(self.reco.lue)
