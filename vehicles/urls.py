from django.urls import path
from . import views

urlpatterns = [
    path('', views.vehicle_list, name='vehicle_list'),
    path('add/', views.vehicle_add, name='vehicle_add'),
    path('<int:pk>/edit/', views.vehicle_edit, name='vehicle_edit'),
    path('<int:pk>/delete/', views.vehicle_delete, name='vehicle_delete'),
    path('<int:pk>/documents/', views.vehicle_documents, name='vehicle_documents'),
    path('<int:pk>/documents/upload/', views.document_upload, name='document_upload'),
    path('documents/<int:doc_pk>/delete/', views.document_delete, name='document_delete'),
]