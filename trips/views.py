from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Trip
from .serializers import TripSerializer


@api_view(['GET'])
def get_trips(request):
    trips = Trip.objects.all().order_by('-id')
    serializer = TripSerializer(trips, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def create_trip(request):
    serializer = TripSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)