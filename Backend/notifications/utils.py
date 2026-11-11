"""Helpers pour créer des notifications depuis les autres apps."""

from django.contrib.auth import get_user_model

from .models import Notification

User = get_user_model()


def _lien_espace(user):
    """Lien d'accueil correspondant au rôle de l'utilisateur."""
    if user.is_staff:
        return '/admin'
    if user.is_conseiller:
        return '/conseiller'
    return '/agriculteur'


def _diffuser_admins(type_, titre, message, exclude=None):
    """Crée une copie de la notification pour chaque administrateur actif."""
    admins = User.objects.filter(is_staff=True, is_active=True)
    if exclude is not None:
        admins = admins.exclude(pk=exclude.pk)
    Notification.objects.bulk_create([
        Notification(
            user=admin,
            type=type_,
            titre=titre,
            message=message,
            lien=_lien_espace(admin),
        )
        for admin in admins
    ])


def notifier_recommandation(recommandation):
    """Notifie le destinataire du message (agriculteur ou conseiller) et les admins."""
    auteur = recommandation.auteur or recommandation.conseiller
    destinataire = (
        recommandation.agriculteur
        if auteur.id == recommandation.conseiller_id
        else recommandation.conseiller
    )
    auteur_nom = auteur.get_full_name() or auteur.username
    dest_nom = destinataire.get_full_name() or destinataire.username
    extrait = recommandation.titre or recommandation.message[:60]
    titre = 'Nouvelle recommandation' if destinataire.is_agriculteur else 'Nouvelle réponse'
    Notification.objects.create(
        user=destinataire,
        type=Notification.Type.RECOMMANDATION,
        titre=titre,
        message=f"{auteur_nom} vous a écrit : {extrait}",
        lien='/agriculteur/recommandations' if destinataire.is_agriculteur
             else '/conseiller/recommandations',
    )
    _diffuser_admins(
        Notification.Type.RECOMMANDATION,
        titre,
        f"{auteur_nom} a écrit à {dest_nom} : {extrait}",
        exclude=destinataire,
    )


def notifier_inscription(user):
    """Notifie les admins du nouveau compte et les conseillers si c'est un agriculteur."""
    role_label = 'un agriculteur' if user.is_agriculteur else 'un conseiller'
    lien = '/admin/agriculteurs' if user.is_agriculteur else '/admin/conseillers'
    nom = user.get_full_name() or user.username
    admins = User.objects.filter(is_staff=True, is_active=True).exclude(pk=user.pk)
    Notification.objects.bulk_create([
        Notification(
            user=admin,
            type=Notification.Type.INSCRIPTION,
            titre='Nouvel utilisateur inscrit',
            message=f"{nom} ({role_label}) vient de créer un compte.",
            lien=lien,
        )
        for admin in admins
    ])
    if user.is_agriculteur:
        conseillers = User.objects.filter(
            role=User.Role.CONSEILLER, is_active=True
        ).exclude(pk=user.pk)
        Notification.objects.bulk_create([
            Notification(
                user=conseiller,
                type=Notification.Type.INSCRIPTION,
                titre='Nouvel agriculteur inscrit',
                message=f"{nom} vient de créer un compte agriculteur.",
                lien='/conseiller/agriculteurs',
            )
            for conseiller in conseillers
        ])


def notifier_compte(user, actif):
    """Notifie l'utilisateur et les admins du changement d'état du compte."""
    titre = 'Compte activé' if actif else 'Compte désactivé'
    message = "Un administrateur a modifié l'état de votre compte."
    Notification.objects.create(
        user=user,
        type=Notification.Type.COMPTE,
        titre=titre,
        message=message,
        lien=_lien_espace(user),
    )
    nom = user.get_full_name() or user.username
    _diffuser_admins(
        Notification.Type.COMPTE,
        titre,
        f"Le compte de {nom} a été {'activé' if actif else 'désactivé'}.",
        exclude=user,
    )
