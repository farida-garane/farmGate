from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()

MOT_DE_PASSE = 'MotDePasse!2026'


class InscriptionTests(APITestCase):

    def test_inscription_cree_le_compte_et_connecte(self):
        response = self.client.post(reverse('utilisateurs:register'), {
            'username': 'awa',
            'password': MOT_DE_PASSE,
            'password2': MOT_DE_PASSE,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['role'], 'AGRICULTEUR')
        self.assertIn('_auth_user_id', self.client.session)
        self.assertTrue(User.objects.get(username='awa').check_password(MOT_DE_PASSE))

    def test_inscription_ignore_le_role_envoye(self):
        response = self.client.post(reverse('utilisateurs:register'), {
            'username': 'pirate',
            'role': 'CONSEILLER',
            'password': MOT_DE_PASSE,
            'password2': MOT_DE_PASSE,
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.get(username='pirate').role, User.Role.AGRICULTEUR)

    def test_inscription_mots_de_passe_differents(self):
        response = self.client.post(reverse('utilisateurs:register'), {
            'username': 'awa',
            'password': MOT_DE_PASSE,
            'password2': 'autre',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class ConnexionTests(APITestCase):

    def setUp(self):
        User.objects.create_user('conseiller', password=MOT_DE_PASSE, role=User.Role.CONSEILLER)

    def test_connexion_ouvre_la_session_et_renvoie_profil(self):
        response = self.client.post(reverse('utilisateurs:login'), {
            'username': 'conseiller',
            'password': MOT_DE_PASSE,
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['role'], 'CONSEILLER')
        self.assertIn('_auth_user_id', self.client.session)

    def test_connexion_mauvais_mot_de_passe(self):
        response = self.client.post(reverse('utilisateurs:login'), {
            'username': 'conseiller',
            'password': 'faux',
        })
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn('_auth_user_id', self.client.session)
