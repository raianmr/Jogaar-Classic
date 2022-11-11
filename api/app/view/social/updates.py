from app.core.campaigning import (
    MiscConflictErr,
    get_existing_campaign,
    get_existing_update,
)
from app.core.security import NotAllowedErr, get_current_valid_user, has_access_over
from app.data.crud import update
from app.data.crud.update import Update, UpdateCreate, UpdateRead, UpdateUpdate
from app.data.crud.user import User
from app.data.session import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

router = APIRouter()


@router.post(
    "/campaigns/{c_id}/updates",
    status_code=status.HTTP_201_CREATED,
    response_model=UpdateRead,
)
async def create_update(
    c_id: int,
    u: UpdateCreate,
    db: Session = Depends(get_db),
    curr_u: User = Depends(get_current_valid_user),
) -> Update:
    existing_c = get_existing_campaign(c_id, db)

    if not has_access_over(existing_c, curr_u):
        raise NotAllowedErr

    try:
        new_u = update.create(c_id, u, db)

    except IntegrityError:
        raise MiscConflictErr

    return new_u


@router.put("/updates/{up_id}", response_model=UpdateRead)
async def update_update(
    up_id: int,
    u: UpdateUpdate,
    db: Session = Depends(get_db),
    curr_u: User = Depends(get_current_valid_user),
) -> Update | None:
    existing_up = get_existing_update(up_id, db)
    existing_c = get_existing_campaign(existing_up.campaign_id, db)

    if not has_access_over(existing_c, curr_u):
        raise NotAllowedErr

    try:
        update.update(existing_up.id, u, db)
        updated_up = update.read(existing_up.id, db)

    except IntegrityError:
        raise MiscConflictErr

    return updated_up


@router.delete(
    "/updates/{up_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_update(
    up_id: int,
    db: Session = Depends(get_db),
    curr_u: User = Depends(get_current_valid_user),
) -> None:
    existing_up = get_existing_update(up_id, db)
    existing_c = get_existing_campaign(existing_up.campaign_id, db)

    if not has_access_over(existing_c, curr_u):
        raise NotAllowedErr

    update.delete(up_id, db)


@router.get("/updates/{up_id}", response_model=UpdateRead)
async def read_update(
    up_id: int,
    db: Session = Depends(get_db),
) -> Update:
    existing_up = get_existing_update(up_id, db)

    return existing_up


@router.get("/campaigns/{c_id}/updates", response_model=list[UpdateRead])
async def read_updates_by_campaign(
    c_id: int,
    limit: int = 100,
    offset: int = 0,
    db: Session = Depends(get_db),
) -> list[Update]:
    all_up_by_c = update.read_all_by_campaign(c_id, limit, offset, db)

    return all_up_by_c
