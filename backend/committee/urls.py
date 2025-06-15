

from django.urls import path
from .views import (
    CreateCommitteeView, GetAllCommitteesView, GetCommitteeByIdView,
    UpdateCommitteeView, DeleteCommitteeView, AddMemberView,
    RemoveMemberView, GetCommitteesByMemberView, GetCommitteesByDateRangeView,
    DownloadFormationLetterView
)

urlpatterns = [
    path('committees/create/', CreateCommitteeView.as_view(), name='create-committee'),
    path('committees/all/', GetAllCommitteesView.as_view(), name='get-all-committees'),
    path('committees/<str:committee_id>/', GetCommitteeByIdView.as_view(), name='get-committee-by-id'),
    path('committees/update/<str:committee_id>/', UpdateCommitteeView.as_view(), name='update-committee'),
    path('committees/deletecommittee/<str:committee_id>/', DeleteCommitteeView.as_view(), name='delete-committee'),
    path('committees/addmember/<str:committee_id>/', AddMemberView.as_view(), name='add-member'),
    path('committees/removemember/<str:committee_id>/', RemoveMemberView.as_view(), name='remove-member'),
    path('committees/<str:committee_id>/members/<str:employee_id>/', RemoveMemberView.as_view(), name='remove-member-legacy'),
    path('committees/bymember/<str:employee_id>/', GetCommitteesByMemberView.as_view(), name='committees-by-member'),
    path('committees/bydaterange/', GetCommitteesByDateRangeView.as_view(), name='committees-by-date-range'),
    path('committees/<str:committee_id>/download/', DownloadFormationLetterView.as_view(), name='download-formation-letter'),
]


