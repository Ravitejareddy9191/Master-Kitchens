from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import SignUpSerializer
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class SignUpView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignUpSerializer

class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)

            reset_link = f"http://localhost:5173/reset-password/{uid}/{token}/"

            send_mail(
                subject="Reset your password",
                message=f"Click to reset: {reset_link}",
                from_email="noreply@masterkitchens.com",
                recipient_list=[email],
            )

            return Response({"message": "Reset link sent"}, status=status.HTTP_200_OK)

        except User.DoesNotExist:
            return Response({"error": "Email not found"}, status=status.HTTP_404_NOT_FOUND)

class ResetPasswordView(APIView):
    def post(self, request, uidb64, token):
        password = request.data.get("password")
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)

            if default_token_generator.check_token(user, token):
                user.set_password(password)
                user.save()
                return Response({"message": "Password has been reset"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

