from backend.common.firebase_admin_init import db
from google.cloud.firestore import SERVER_TIMESTAMP, ArrayUnion
import logging

logger = logging.getLogger(__name__)

"""
This module provides functions to interact with a Firestore database, allowing for operations related to users, badges, challenges, quests, and achievements within a gamified system. Each function communicates with Firestore collections and documents, performing CRUD operations.

Functions:
- add_user(user_id: str, username: str, level: int = 1, experience: int = 0, forum_points: int = 100): Adds a new user to the 'Users' collection.
- add_badge(badge_id: str, name: str, description: str, criteria: dict): Adds a new badge to the 'Badges' collection.
- link_badge_to_user(user_id: str, badge_id: str): Links a badge to a user by creating a document in the 'UserBadges' subcollection.
- add_challenge(challenge_id: str, name: str, description: str, criteria: dict, reward_points: int): Adds a new challenge to the 'Challenges' collection.
- complete_challenge(user_id: str, challenge_id: str): Marks a challenge as completed for a user by creating a document in the 'UserChallenges' subcollection.
- add_quest(quest_id: str, name: str, description: str, challenges: list): Adds a new quest to the 'Quests' collection.
- start_quest(user_id: str, quest_id: str): Marks a quest as started for a user by creating a document in the 'UserQuests' subcollection.
- complete_quest(user_id: str, quest_id: str): Marks a quest as completed for a user by updating the document in the 'UserQuests' subcollection.
- add_achievement(user_id: str, achievement_id: str, name: str, description: str): Adds a new achievement for a user by creating a document in the 'UserAchievements' subcollection.
- get_user_points_and_badges(user_id: str): Retrieves the total points and badges for a user.
- award_user_points(user_id: str, points: int): Awards points to a user.
- award_user_badge(user_id: str, badge_name: str): Awards a badge to a user if the badge is not already awarded.

Each function utilizes Firestore's SERVER_TIMESTAMP for date fields to ensure consistency with server time.
"""

def award_points(user_id: str, points: int) -> None:
    """
    Awards points to a user.
    
    Args:
        user_id (str): The ID of the user.
        points (int): The number of points to award.
    
    Raises:
        ValueError: If points is not a positive integer.
    """
    if points <= 0:
        raise ValueError("Points must be a positive integer.")
    
    user_ref = db.collection('Users').document(user_id)

    def update_points(transaction):
        snapshot = transaction.get(user_ref)
        if not snapshot.exists:
            raise ValueError("User not found.")
        
        new_points = snapshot.get('forum_points', 0) + points
        transaction.update(user_ref, {'forum_points': new_points})

    transaction = db.transaction()
    update_points(transaction)


def add_user(user_id: str, username: str, level: int = 1, experience: int = 0, forum_points: int = 100) -> None:
    """
    Adds a new user to the 'Users' collection.
    
    Args:
        user_id (str): The ID of the user.
        username (str): The username of the user.
        level (int): The initial level of the user.
        experience (int): The initial experience of the user.
        forum_points (int): The initial forum points of the user.
    """
    user_ref = db.collection('Users').document(user_id)
    user_ref.set({
        'username': username,
        'level': level,
        'experience': experience,
        'forum_points': forum_points,
    })

def add_badge(badge_id: str, name: str, description: str, criteria: dict) -> None:
    """
    Adds a new badge to the 'Badges' collection.
    
    Args:
        badge_id (str): The ID of the badge.
        name (str): The name of the badge.
        description (str): The description of the badge.
        criteria (dict): The criteria for earning the badge.
    """
    badge_ref = db.collection('Badges').document(badge_id)
    badge_ref.set({
        'name': name,
        'description': description,
        'criteria': criteria,
    })

def link_badge_to_user(user_id: str, badge_id: str) -> None:
    """
    Links a badge to a user by creating a document in the 'UserBadges' subcollection.
    
    Args:
        user_id (str): The ID of the user.
        badge_id (str): The ID of the badge.
    """
    user_ref = db.collection('Users').document(user_id)
    user_badge_ref = user_ref.collection('UserBadges').document(badge_id)
    user_badge_ref.set({
        'awarded_at': SERVER_TIMESTAMP,
    })

def add_challenge(challenge_id: str, name: str, description: str, criteria: dict, reward_points: int) -> None:
    """
    Adds a new challenge to the 'Challenges' collection.
    
    Args:
        challenge_id (str): The ID of the challenge.
        name (str): The name of the challenge.
        description (str): The description of the challenge.
        criteria (dict): The criteria for completing the challenge.
        reward_points (int): The points awarded for completing the challenge.
    """
    challenge_ref = db.collection('Challenges').document(challenge_id)
    challenge_ref.set({
        'name': name,
        'description': description,
        'criteria': criteria,
        'reward_points': reward_points,
    })

def complete_challenge(user_id: str, challenge_id: str) -> None:
    """
    Marks a challenge as completed for a user by creating a document in the 'UserChallenges' subcollection.
    
    Args:
        user_id (str): The ID of the user.
        challenge_id (str): The ID of the challenge.
    """
    user_ref = db.collection('Users').document(user_id)
    user_challenge_ref = user_ref.collection('UserChallenges').document(challenge_id)
    user_challenge_ref.set({
        'completed_at': SERVER_TIMESTAMP,
    })

def add_quest(quest_id: str, name: str, description: str, challenges: list) -> None:
    """
    Adds a new quest to the 'Quests' collection.
    
    Args:
        quest_id (str): The ID of the quest.
        name (str): The name of the quest.
        description (str): The description of the quest.
        challenges (list): The list of challenge IDs included in the quest.
    """
    quest_ref = db.collection('Quests').document(quest_id)
    quest_ref.set({
        'name': name,
        'description': description,
        'challenges': ArrayUnion(challenges),
    })

def start_quest(user_id: str, quest_id: str) -> None:
    """
    Marks a quest as started for a user by creating a document in the 'UserQuests' subcollection.
    
    Args:
        user_id (str): The ID of the user.
        quest_id (str): The ID of the quest.
    """
    user_ref = db.collection('Users').document(user_id)
    user_quest_ref = user_ref.collection('UserQuests').document(quest_id)
    user_quest_ref.set({
        'started_at': SERVER_TIMESTAMP,
        'completed_at': None,
    })

def complete_quest(user_id: str, quest_id: str) -> None:
    """
    Marks a quest as completed for a user by updating the document in the 'UserQuests' subcollection.
    
    Args:
        user_id (str): The ID of the user.
        quest_id (str): The ID of the quest.
    """
    user_ref = db.collection('Users').document(user_id)
    user_quest_ref = user_ref.collection('UserQuests').document(quest_id)
    user_quest_ref.update({
        'completed_at': SERVER_TIMESTAMP,
    })

def add_achievement(user_id: str, achievement_id: str, name: str, description: str) -> None:
    """
    Adds a new achievement for a user by creating a document in the 'UserAchievements' subcollection.
    
    Args:
        user_id (str): The ID of the user.
        achievement_id (str): The ID of the achievement.
        name (str): The name of the achievement.
        description (str): The description of the achievement.
    """
    user_ref = db.collection('Users').document(user_id)
    user_achievement_ref = user_ref.collection('UserAchievements').document(achievement_id)
    user_achievement_ref.set({
        'name': name,
        'description': description,
        'achieved_at': SERVER_TIMESTAMP,
    })

def get_user_points_and_badges(user_id: str) -> dict:
    """
    Retrieves the total points and badges for a user.
    
    Args:
        user_id (str): The ID of the user.
    
    Returns:
        dict: A dictionary containing the total points and total badges.
    """
    try:
        user_ref = db.collection('Users').document(user_id)
        user_doc = user_ref.get()

        if not user_doc.exists:
            raise ValueError("User not found.")

        user_data = user_doc.to_dict()  # Convert document to dictionary
        if user_data is None:  # Check if the conversion was successful
            raise ValueError("Failed to retrieve user data.")

        user_badges_ref = user_ref.collection('UserBadges').get()
        total_points = user_data.get('forum_points', 0)  # Use the converted dictionary
        total_badges = len(user_badges_ref)
        
        return {
            "total_points": total_points,
            "total_badges": total_badges
        }
    except Exception as e:
        logger.error(f"Error retrieving user points and badges: {e}")
        raise e

def award_user_points(user_id: str, points: int) -> None:
    """
    Awards points to a user.
    
    Args:
        user_id (str): The ID of the user.
        points (int): The number of points to award.
    
    Raises:
        ValueError: If points is not a positive integer.
    """
    if points <= 0:
        raise ValueError("Points must be a positive integer.")
    
    user_ref = db.collection('Users').document(user_id)

    def update_points(transaction):
        snapshot = transaction.get(user_ref)
        if not snapshot.exists:
            raise ValueError("User not found.")
        
        new_points = snapshot.get('forum_points', 0) + points
        transaction.update(user_ref, {'forum_points': new_points})

    transaction = db.transaction()
    update_points(transaction)

def award_user_badge(user_id: str, badge_name: str) -> None:
    """
    Awards a badge to a user if the badge is not already awarded.
    
    Args:
        user_id (str): The ID of the user.
        badge_name (str): The name of the badge.
    
    Raises:
        ValueError: If the badge is not found.
    """
    badges_ref = db.collection('Badges').where('name', '==', badge_name).limit(1).get()
    
    if badges_ref is None or len(badges_ref) == 0:
        raise ValueError("Badge not found.")
    
    badge_id = badges_ref[0].id
    user_badge_ref = db.collection('Users').document(user_id).collection('UserBadges').document(badge_id)
    
    if not user_badge_ref.get().exists:
        user_badge_ref.set({
            'awarded_at': SERVER_TIMESTAMP,
        })
