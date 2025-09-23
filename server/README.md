Classroom Backend (Express)

- Run: `npm run dev`
- Env: create `.env` with `PORT=4000` and `JWT_SECRET=change-me`
- Auth: `/auth/register`, `/auth/login`, `/auth/me`, 2FA stub at `/auth/2fa/verify`
- RBAC: student/teacher/admin via middleware
- Routes: `/student/*`, `/teacher/*`, `/admin/*`, shared `/files/*`, `/resources`, `/timetable`

