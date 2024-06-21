from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class MyCustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer for obtaining token pairs with additional claims.

    This serializer extends the base TokenObtainPairSerializer and adds custom claims
    to the token payload. The additional claims include the user's full name and email.

    Usage:
    ------
    serializer = MyCustomTokenObtainPairSerializer(data=request.data)
    if serializer.is_valid():
        token = serializer.get_token(user)
        # ...
    """

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token["name"] = user.get_full_name()
        token["email"] = user.email
        # ...
        return token
