'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { SurveyVisibility } from '@/lib/config/survey'
import type { UserRole } from '@/lib/config/user'
import type { ID } from '@/lib/db/types'

type UserOption = {
  id: ID
  email: string
  role: UserRole
}

type SurveyVisibilitySelectorProps = {
  visibility: SurveyVisibility
  onVisibilityChange: (value: SurveyVisibility) => void
  users: UserOption[]
  selectedUserIds: ID[]
  onSelectedUserIdsChange: (ids: ID[]) => void
  isLoadingUsers?: boolean
  usersError?: Error | null
}

export function SurveyVisibilitySelector({
  visibility,
  onVisibilityChange,
  users,
  selectedUserIds,
  onSelectedUserIdsChange,
  isLoadingUsers,
  usersError,
}: SurveyVisibilitySelectorProps) {
  const handleToggleUser = (userId: ID, checked: boolean | 'indeterminate') => {
    const isChecked = checked === true

    if (isChecked) {
      if (!selectedUserIds.includes(userId)) {
        onSelectedUserIdsChange([...selectedUserIds, userId])
      }
      return
    }

    onSelectedUserIdsChange(selectedUserIds.filter((id) => id !== userId))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs font-medium text-gray-700">Survey visibility</Label>
        <RadioGroup
          value={visibility}
          onValueChange={(value) => onVisibilityChange(value as SurveyVisibility)}
          className="grid gap-2 sm:grid-cols-2"
        >
          <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
            <RadioGroupItem id="visibility-public" value="public" className="mt-1" />
            <Label
              htmlFor="visibility-public"
              className="space-y-0.5 text-sm font-medium text-gray-900"
            >
              <span>Public</span>
              <p className="text-xs font-normal text-gray-500">All users can access this survey.</p>
            </Label>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
            <RadioGroupItem id="visibility-private" value="private" className="mt-1" />
            <Label
              htmlFor="visibility-private"
              className="space-y-0.5 text-sm font-medium text-gray-900"
            >
              <span>Private</span>
              <p className="text-xs font-normal text-gray-500">
                Only selected users will be able to access this survey.
              </p>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {visibility === 'private' && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-gray-700">Assigned users</Label>

          {isLoadingUsers ? (
            <p className="text-xs text-gray-500">Loading users…</p>
          ) : usersError ? (
            <p className="text-xs text-red-600">Failed to load users. Please try again later.</p>
          ) : users.length === 0 ? (
            <p className="text-xs text-gray-500">No users available to assign.</p>
          ) : (
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-md border border-gray-200 bg-white p-2 text-sm">
              {users.map((user) => {
                const checked = selectedUserIds.includes(user.id)

                return (
                  <label
                    key={user.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded px-2 py-1 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => handleToggleUser(user.id, value)}
                        aria-label={`Assign ${user.email}`}
                      />
                      <span className="text-xs font-medium text-gray-800">{user.email}</span>
                    </div>
                    <span className="text-[11px] uppercase tracking-wide text-gray-400">
                      {user.role}
                    </span>
                  </label>
                )
              })}
            </div>
          )}

          {visibility === 'private' &&
            selectedUserIds.length === 0 &&
            !isLoadingUsers &&
            !usersError && (
              <p className="text-[11px] text-amber-600">
                Select at least one user to ensure the survey is accessible.
              </p>
            )}
        </div>
      )}
    </div>
  )
}
