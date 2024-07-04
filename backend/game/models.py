""" from django.db import models
from django.contrib.auth import get_user_model
from django.utils.timezone import now
from django.core.exceptions import ValidationError
from common.firestore_mixins import TimestampMixin, UserRelatedMixin
from common.validators import validate_criteria

User = get_user_model()

class UserLevel(models.Model):
    Represents the level of a user in the game.

    Attributes:
        user (OneToOneField): The user associated with the level.
        level (int): The level of the user.
        experience (int): The experience points of the user.

    Methods:
        __str__(): Returns a string representation of the user level.
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="level", verbose_name="User")
    level = models.IntegerField(default=1, verbose_name="Level")
    experience = models.IntegerField(default=0, verbose_name="Experience")

    class Meta:
        verbose_name = "User Level"
        verbose_name_plural = "User Levels"

    def __str__(self):
        return f"{self.user.pk} - Level {self.level}"

class UserForumPoints(models.Model):
    Represents the forum points of a user in the game.

    Attributes:
        user (OneToOneField): The user associated with the forum points.
        points (PositiveIntegerField): The points of the user.

    Methods:

        __str__(): Returns a string representation of the user forum points.
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="forum_points", verbose_name="User")
    points = models.PositiveIntegerField(default=0, verbose_name="Points")

    class Meta:
        verbose_name = "User Forum Point"
        verbose_name_plural = "User Forum Points"

    def __str__(self):
        return f"{self.user.pk} - {self.points} points"


class Badge(models.Model):
    Represents a badge in the game.

    Attributes:
        name (str): The name of the badge.
        description (str): The description of the badge.
        image (ImageField): The image associated with the badge.
        criteria (dict): The criteria required to earn the badge.

    Methods:
        clean(): Validates the badge criteria.
        __str__(): Returns a string representation of the badge.

    name = models.CharField(max_length=50, unique=True, verbose_name="Name")
    description = models.CharField(max_length=255, verbose_name="Description")
    image = models.ImageField(upload_to="badges/", blank=True, null=True, verbose_name="Image")
    criteria = models.JSONField(default=dict, verbose_name="Criteria", validators=[validate_criteria])

    def clean(self):
        criteria = self.criteria
        if not criteria:
            raise ValidationError("Criteria cannot be empty.")
        if "min_points" in criteria and not isinstance(criteria["min_points"], int):
            raise ValidationError("The 'min_points' must be an integer.")
        super().clean()

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Badge"
        verbose_name_plural = "Badges"

class UserBadge(TimestampMixin, UserRelatedMixin):
    Represents a badge earned by a user in the game.

    Attributes:

        user (ForeignKey): The user associated with the badge.
        badge (ForeignKey): The badge earned by the user.
        awarded_at (DateTimeField): The date and time the badge was awarded.

    Methods:
    
            __str__(): Returns a string representation of the user badge.
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name="user_badges", verbose_name="Badge")
    awarded_at = models.DateTimeField(auto_now_add=True, verbose_name="Awarded At")

    class Meta:
        unique_together = ("user", "badge")
        verbose_name = "User Badge"
        verbose_name_plural = "User Badges"

    def __str__(self):
        return f"{self.user.username} - {self.badge.name}"

class Challenge(models.Model):
    Represents a challenge in the game.

    Attributes:
        name (str): The name of the challenge.
        description (str): The description of the challenge.
        criteria (dict): The criteria required to complete the challenge.
        reward_points (PositiveIntegerField): The reward points for completing the challenge.

    Methods:

        __str__(): Returns a string representation of the challenge.
    name = models.CharField(max_length=100, verbose_name="Name")
    description = models.TextField(verbose_name="Description")
    criteria = models.JSONField(default=dict, verbose_name="Criteria")
    reward_points = models.PositiveIntegerField(default=0, verbose_name="Reward Points")

    class Meta:
        verbose_name = "Challenge"
        verbose_name_plural = "Challenges"

    def __str__(self):
        return self.name

class UserChallenge(models.Model):
    Represents a challenge completed by a user in the game.

    Attributes:
        user (ForeignKey): The user associated with the challenge.
        challenge (ForeignKey): The challenge completed by the user.
        completed_at (DateTimeField): The date and time the challenge was completed.

    Methods:
        __str__(): Returns a string representation of the user challenge.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="completed_challenges", verbose_name="User")
    challenge = models.ForeignKey(Challenge, on_delete=models.CASCADE, verbose_name="Challenge")
    completed_at = models.DateTimeField(auto_now_add=True, verbose_name="Completed At")

    class Meta:
        unique_together = ("user", "challenge")
        verbose_name = "User Challenge"
        verbose_name_plural = "User Challenges"

    def __str__(self):
        return f"{self.user.pk} - {self.challenge.name}"

class Quest(models.Model):
    Represents a quest in the game.

    Attributes:
        name (str): The name of the quest.
        description (str): The description of the quest.
        challenges (ManyToManyField): The challenges associated with the quest.

    Methods:
        __str__(): Returns a string representation of the quest.

    name = models.CharField(max_length=100, verbose_name="Name")
    description = models.TextField(verbose_name="Description")
    challenges = models.ManyToManyField(Challenge, verbose_name="Challenges")

    class Meta:
        verbose_name = "Quest"
        verbose_name_plural = "Quests"

    def __str__(self):
        return self.name

class UserQuest(models.Model):

    Represents a quest started by a user in the game.

    Attributes:
        
                user (ForeignKey): The user associated with the quest.
                quest (ForeignKey): The quest started by the user.
                started_at (DateTimeField): The date and time the quest was started.
                completed_at (DateTimeField): The date and time the quest was completed.

    Methods:
            
                    __str__(): Returns a string representation of the user quest.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="quests", verbose_name="User")
    quest = models.ForeignKey(Quest, on_delete=models.CASCADE, verbose_name="Quest")
    started_at = models.DateTimeField(default=now, verbose_name="Started At")
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name="Completed At")

    class Meta:
        verbose_name = "User Quest"
        verbose_name_plural = "User Quests"

    def __str__(self):
        return f"{self.user.pk} - {self.quest.name}"

class UserAchievement(models.Model):

    Represents an achievement earned by a user in the game.

    Attributes:
    
            user (ForeignKey): The user associated with the achievement.
            name (str): The name of the achievement.
            description (str): The description of the achievement.
            achieved_at (DateTimeField): The date and time the achievement was achieved.

    Methods:
    
            __str__(): Returns a string representation of the user achievement.
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="achievements", verbose_name="User")
    name = models.CharField(max_length=100, verbose_name="Name")
    description = models.TextField(verbose_name="Description")
    achieved_at = models.DateTimeField(auto_now_add=True, verbose_name="Achieved At")

    class Meta:
        verbose_name = "User Achievement"
        verbose_name_plural = "User Achievements"

    def __str__(self):
        return f"{self.user.pk} - {self.name}" """