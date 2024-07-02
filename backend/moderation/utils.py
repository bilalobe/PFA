from firebase_admin import messaging
from backend.AI.views import correct_text, sentiment_analysis
from backend.enrollments.utils import send_email
from django.conf import settings

def analyze_and_flag_post(post_ref):
    """
    Analyzes the content of a post and flags it if necessary.

    Args:
        post_ref: A reference to the post in the database.

    Returns:
        None
    """
    post = post_ref.get() if post_ref else None
    if post and post.exists():
        post_data = post.to_dict()
        process_post_content(post_ref, post_data)

def process_post_content(post_ref, post_data):
    """
    Process the content of a post by correcting the text, performing sentiment analysis,
    and updating the post reference with the corrected content and sentiment.

    Args:
        post_ref (reference): Reference to the post in the database.
        post_data (dict): Dictionary containing the post data.

    Returns:
        None
    """
    corrected_content = correct_text(post_data['content'])
    sentiment_result = sentiment_analysis(corrected_content)
    sentiment = sentiment_result['sentiment']
    post_ref.update({'sentiment': sentiment, 'content': corrected_content})

    if sentiment == "negative":
        handle_negative_sentiment(post_data)

def handle_negative_sentiment(post_data):
    """
    Handles negative sentiment in a post.

    Args:
        post_data (dict): The data of the post.

    Returns:
        None
    """
    author_ref = post_data['author']
    author_doc = author_ref.get()
    if author_doc.exists():
        author_data = author_doc.to_dict()
        update_author_strikes_and_ban_if_necessary(author_ref, post_data)

def update_author_strikes_and_ban_if_necessary(author_ref, author_data):
    """
    Updates the strikes count for an author and bans them if necessary.

    Args:
        author_ref (reference): A reference to the author's data in the database.
        author_data (dict): The current data of the author.

    Returns:
        None
    """
    strikes = author_data.get('strikes', 0) + 1
    author_ref.update({'strikes': strikes})

    if strikes >= 3:
        ban_author(author_ref, author_data)

def ban_author(author_ref, author_data):
    """
    Bans the author from the forum by updating the 'banned_from_forum' field in the author reference
    and sends a ban notification email to the author's email address.

    Args:
        author_ref (Reference): The reference to the author in the database.
        author_data (dict): The data of the author, including the email address.

    Returns:
        None
    """
    author_ref.update({'banned_from_forum': True})
    send_ban_notification_email(author_data.get('email'))

def send_ban_notification_email(author_email):
    """Send a notification email to a user about a forum posting ban.

    Args:
        author_email (str): The email address of the user to notify.
    """
    if author_email:
        send_email(
            'Forum Posting Ban Notification',
            'Due to repeated violations of our community guidelines, '
            'your account has been banned from posting in the forum.',
            settings.DEFAULT_FROM_EMAIL,
            [author_email],
        )

def send_moderation_notification(user, action_taken):
    """
    Sends a moderation notification to a user.

    Args:
        user (User): The user to send the notification to.
        action_taken (str): The action taken against the user for violating the rules.

    Returns:
        None
    """
    try:
        message = messaging.Message(
            notification=messaging.Notification(
                title="Moderation Action",
                body=f"You have been {action_taken} for violating the rules."
            ),
            token=user.firebase_token,
        )
        response = messaging.send(message)
        print(f"Firebase notification sent: {response}")
    except Exception as e:
        print(f"Failed to send notification: {e}")