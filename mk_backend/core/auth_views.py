from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from .models import WorkerProfile, Employer
from .serializers import WorkerProfileSerializer, EmployerSerializer
from django.db import transaction


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_worker(request):
    """Register a new worker with phone-based authentication"""
    try:
        data = request.data

        # Required fields
        phone_number = data.get("phone_number")
        full_name = data.get("full_name")
        location = data.get("location")
        skills = data.get("skills", [])

        if not all([phone_number, full_name, location]):
            return Response(
                {"error": "Phone number, full name, and location are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Check if worker already exists
        if WorkerProfile.objects.filter(phone_number=phone_number).exists():
            return Response(
                {"error": "Worker with this phone number already exists"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        with transaction.atomic():
            # Create user account (using phone as username)
            username = f"worker_{phone_number.replace('+', '').replace(' ', '')}"
            user = User.objects.create_user(
                username=username,
                first_name=full_name.split()[0] if full_name.split() else "",
                last_name=(
                    " ".join(full_name.split()[1:])
                    if len(full_name.split()) > 1
                    else ""
                ),
            )

            # Create worker profile
            worker = WorkerProfile.objects.create(
                user=user,
                phone_number=phone_number,
                full_name=full_name,
                location=location,
                skills=skills,
                experience_level=data.get("experience_level", "entry"),
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Worker registered successfully",
                "worker": WorkerProfileSerializer(worker).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        return Response(
            {"error": f"Registration failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def register_employer(request):
    """Register a new employer"""
    try:
        data = request.data
        print(data)
        # Required fields - match frontend field names
        company_name = data.get("company_name") or data.get(
            "name"
        )  # Support both field names
        email = data.get("email")
        password = data.get("password")
        phone = data.get("phone") or data.get(
            "phone_number"
        )  # Support both field names
        sector = data.get("sector")
        # Validate required fields
        if not all([email, password, company_name, phone, sector]):
            return Response(
                {
                    "error": "All fields are required: company_name/name, email, password, phone/phone_number, sector"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        print(data)
        # Generate username from email (before @ symbol)
        username = email.split("@")[0]
        # If username exists, append company name
        if User.objects.filter(username=username).exists():
            username = f"{username}_{company_name.lower().replace(' ', '_')}"

        # Make sure username is unique by adding numbers if needed
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        # Check if email already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Normalize sector to lowercase
        sector = sector.lower()
        valid_sectors = [
            "construction",
            "hospitality",
            "retail",
            "manufacturing",
            "agriculture",
            "transport",
            "other",
        ]
        if sector not in valid_sectors:
            sector = "other"  # Default to 'other' if not recognized

        with transaction.atomic():
            # Create user account
            user = User.objects.create_user(
                username=username, email=email, password=password
            )

            # Create employer profile
            employer = Employer.objects.create(
                user=user,
                company_name=company_name,
                email=email,
                phone=phone,
                sector=sector,
                verified=False,  # Requires manual verification
            )

        # Generate tokens
        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Employer registered successfully. Account pending verification.",
                "employer": EmployerSerializer(employer).data,
                "tokens": {
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
            },
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        return Response(
            {"error": f"Registration failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_worker(request):
    """Login worker using phone number"""
    try:
        phone_number = request.data.get("phone_number")

        if not phone_number:
            return Response(
                {"error": "Phone number is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            worker = WorkerProfile.objects.get(phone_number=phone_number)
            user = worker.user

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "Login successful",
                    "worker": WorkerProfileSerializer(worker).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                }
            )

        except WorkerProfile.DoesNotExist:
            return Response(
                {"error": "Worker not found with this phone number"},
                status=status.HTTP_404_NOT_FOUND,
            )

    except Exception as e:
        return Response(
            {"error": f"Login failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


# login employer
@api_view(["POST"])
@permission_classes([permissions.AllowAny])
def login_employer(request):
    """Login employer using email and password"""
    try:
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response(
                {"error": "Email and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            # Find user by email
            user = User.objects.get(email=email)

            # Check password
            if not user.check_password(password):
                return Response(
                    {"error": "Invalid credentials"},
                    status=status.HTTP_401_UNAUTHORIZED,
                )

            # Check if user has an employer profile
            if not hasattr(user, "employer_profile"):
                return Response(
                    {"error": "No employer profile found for this user"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            employer = user.employer_profile

            # Generate tokens
            refresh = RefreshToken.for_user(user)

            return Response(
                {
                    "message": "Login successful",
                    "employer": EmployerSerializer(employer).data,
                    "tokens": {
                        "refresh": str(refresh),
                        "access": str(refresh.access_token),
                    },
                }
            )

        except User.DoesNotExist:
            return Response(
                {"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED
            )

    except Exception as e:
        return Response(
            {"error": f"Login failed: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_user_profile(request):
    """Get current user profile (worker or employer)"""
    user = request.user

    # Check if user is a worker
    if hasattr(user, "workerprofile"):
        return Response(
            {
                "user_type": "worker",
                "profile": WorkerProfileSerializer(user.workerprofile).data,
            }
        )

    # Check if user is an employer
    elif hasattr(user, "employer_profile"):
        return Response(
            {"user_type": "employer", "profile": EmployerSerializer(user.employer_profile).data}
        )

    else:
        return Response(
            {
                "user_type": "admin",
                "profile": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                },
            }
        )
