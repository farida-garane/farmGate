from datetime import date

from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Campagne, Parcelle

User = get_user_model()


class AgriculteurTests(APITestCase):

    def setUp(self):
        self.agri = User.objects.create_user('awa', password='x')
        self.autre = User.objects.create_user('ali', password='x')
        self.parcelle = Parcelle.objects.create(agriculteur=self.agri, nom='Champ nord', superficie=2)
        self.campagne = Campagne.objects.create(
            parcelle=self.parcelle, culture='Maïs', date_debut=date(2026, 6, 1)
        )
        self.client.force_authenticate(self.agri)

    def test_creation_parcelle_rattachee_a_l_agriculteur(self):
        response = self.client.post(reverse('agriculteur:parcelle-list'), {
            'nom': 'Champ sud',
            'superficie': '1.50',
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Parcelle.objects.get(nom='Champ sud').agriculteur, self.agri)

    def test_ne_voit_que_ses_parcelles(self):
        Parcelle.objects.create(agriculteur=self.autre, nom='Autre champ', superficie=1)
        response = self.client.get(reverse('agriculteur:parcelle-list'))
        self.assertEqual([p['nom'] for p in response.data], ['Champ nord'])

    def test_campagne_sur_parcelle_d_un_autre_refusee(self):
        parcelle_autre = Parcelle.objects.create(agriculteur=self.autre, nom='Autre', superficie=1)
        response = self.client.post(reverse('agriculteur:campagne-list'), {
            'parcelle': parcelle_autre.pk,
            'culture': 'Sorgho',
            'date_debut': '2026-06-01',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_campagne_date_fin_avant_debut(self):
        response = self.client.post(reverse('agriculteur:campagne-list'), {
            'parcelle': self.parcelle.pk,
            'culture': 'Sorgho',
            'date_debut': '2026-06-01',
            'date_fin': '2026-05-01',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_ajout_intervention_depense_recolte(self):
        donnees = {
            'intervention': {'campagne': self.campagne.pk, 'type': 'SEMIS', 'date': '2026-06-02'},
            'depense': {'campagne': self.campagne.pk, 'categorie': 'SEMENCES',
                        'montant': '25000', 'date': '2026-06-01'},
            'recolte': {'campagne': self.campagne.pk, 'date': '2026-10-10',
                        'quantite': '800', 'unite': 'KG'},
        }
        for nom, payload in donnees.items():
            response = self.client.post(reverse(f'agriculteur:{nom}-list'), payload)
            self.assertEqual(response.status_code, status.HTTP_201_CREATED, nom)

    def test_depense_sur_campagne_d_un_autre_refusee(self):
        parcelle_autre = Parcelle.objects.create(agriculteur=self.autre, nom='Autre', superficie=1)
        campagne_autre = Campagne.objects.create(
            parcelle=parcelle_autre, culture='Riz', date_debut=date(2026, 6, 1)
        )
        response = self.client.post(reverse('agriculteur:depense-list'), {
            'campagne': campagne_autre.pk,
            'categorie': 'SEMENCES',
            'montant': '1000',
            'date': '2026-06-01',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_conseiller_refuse(self):
        conseiller = User.objects.create_user('c', password='x', role=User.Role.CONSEILLER)
        self.client.force_authenticate(conseiller)
        response = self.client.get(reverse('agriculteur:parcelle-list'))
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
