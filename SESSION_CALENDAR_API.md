# Session & Class Calendar — Backend API Spec

**Base URL:** `https://eduhive-lms-backend.vercel.app`  
**Auth:** `Authorization: Bearer <token>`  
**Content-Type:** `application/json` (except course image upload)

Ye file frontend ke actual calendar/session calls ke mutabiq **implemented backend APIs** document karti hai. Calendar ab localStorage fallback ke baghair live backend se chal sakta hai.

---

## Status vs spec (kya already tha, kya add/fix hua)

| Item | Pehle | Ab |
|---|---|---|
| `GET /api/admin/sessions` | Thi, lekin `course` sirf `title`, sort desc, `courseId`/`teacherId` nahi | Populated `course` + `instructor`/`teacher`, `courseId`, `teacherId`, sort `startTime` asc |
| `GET /api/sessions` | Nahi thi (calendar fallback fail) | Implemented, role-based list |
| `POST /api/admin/sessions` | `endTime` + `meetingLink` required, type/duration nahi | `endTime` optional (duration se auto), `perClassFee` required nahi, type/duration/description supported, `201` + `_id` |
| `PUT` / `PATCH /api/admin/sessions/:id` | Nahi thi | Dono implemented, `{ status }` save hota hai |
| `GET /api/teacher/sessions` | Thi, same session docs | Same formatted records as admin calendar |
| `GET /api/student/students-sessions` | Thi | Same records + `endTime` always present |
| `GET /api/admin/courses` | Thi | `board`, `code`, `courseCode`, `serialNumber` return |
| `GET /api/admin/courses/:id` | Nahi thi | Implemented (`_id` ya `code` se) |
| `POST` / `PUT /api/admin/courses` | `serialNumber` required, unique `code` nahi | `code` / `courseCode` save, title+board unique |
| `GET /api/admin/teachers` | Already working | No change needed |

**Remove / avoid (backend ab require nahi karta):**

- `perClassFee` / `perClassFees` on create
- client-sent `endTime` (optional; missing ho to server calculate karta hai)
- Class types jaise Lecture / Lab / Seminar / Workshop / Exam — sirf **Regular Class** | **Extra Class**

---

## Auth

Har endpoint (admin login ke ilawa) Bearer token mangta hai:

```
Authorization: Bearer <jwt>
```

| Role | Token from |
|---|---|
| Admin | `POST /api/admin/login` |
| Teacher | `POST /api/auth/teacher-login` |
| Student | `POST /api/auth/student-login` |

Admin session/course/teacher APIs ke liye **admin token** zaroori hai. Teacher/student list endpoints apne role ke token se chalte hain.

---

## 1. Current frontend behavior

| Screen | File | API |
|---|---|---|
| Class Calendar | `src/pages/mypages/ClassCalendar.jsx` | `GET /api/admin/sessions`, fallback `GET /api/sessions`. Save: `POST /api/admin/sessions` |
| All Sessions | `src/components/mycomponents/teacher/SessionsList.jsx` | `GET /api/admin/sessions`. Status: `PUT` then `PATCH` |
| Create Session | `src/pages/mypages/SessionCreate.jsx` | `POST /api/admin/sessions` |
| Dashboard chart | `src/components/mycomponents/admin/NumberOfClassesChart.jsx` | Same session GET |
| Teacher ongoing | `src/components/mycomponents/teacher/OngoingClasses.jsx` | `GET /api/teacher/sessions` |
| Student lectures | `src/components/mycomponents/students/LectureSchedule.jsx` | `GET /api/student/students-sessions` |
| Course dropdown | Calendar / Create Session | `GET /api/admin/courses` |
| Instructor dropdown | Calendar / Create Session | `GET /api/admin/teachers` |
| Course detail | `src/pages/mypages/AdminCourseDetail.jsx` | `GET /api/admin/courses/:id` |

---

## 2. Session APIs

Shared session object (list + create + update response):

```json
{
  "_id": "66f1a1b2c3d4e5f678901234",
  "title": "Physics Chapter 4",
  "topic": "Newton Laws",
  "courseId": "66aa11111111111111111111",
  "teacherId": "66bb22222222222222222222",
  "course": {
    "_id": "66aa11111111111111111111",
    "title": "Physics",
    "board": "Olevel GCE Cambridge",
    "code": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
    "serialNumber": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
    "description": "O Level Physics",
    "isActive": true
  },
  "instructor": {
    "_id": "66bb22222222222222222222",
    "name": "Ali Khan"
  },
  "teacher": {
    "_id": "66bb22222222222222222222",
    "name": "Ali Khan"
  },
  "startTime": "2026-09-15T10:00:00.000Z",
  "endTime": "2026-09-15T11:00:00.000Z",
  "duration": "60 mins",
  "type": "Regular Class",
  "status": "Scheduled",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "description": "Agenda notes",
  "createdAt": "2026-09-14T08:00:00.000Z",
  "updatedAt": "2026-09-14T08:00:00.000Z"
}
```

`teacher` = `instructor` ka alias. Frontend dono accept karta hai.

### Status enum

Stored values:

```
Scheduled | conducted | not_conducted | Cancelled | ongoing | pending | completed
```

| Value | Kab use hota hai |
|---|---|
| `Scheduled` | Calendar/create default |
| `conducted` | All Sessions page + teacher checkout |
| `not_conducted` | All Sessions page |
| `Cancelled` | Cancel |
| `ongoing` | Teacher check-in (attendance) |
| `pending` | Legacy records only |
| `completed` | Legacy alias; write pe `conducted` ban jata hai |

Aliases on write:

- `completed` → `conducted`
- `not conducted` → `not_conducted`
- `cancelled` → `Cancelled`
- `pending` → `Scheduled`

### Type enum

```
Regular Class | Extra Class
```

Default: `Regular Class`

### Duration enum

```
45 mins | 60 mins | 90 mins | 120 mins
```

Default: `60 mins`

Agar `endTime` na bhejo:

```
endTime = startTime + duration minutes
```

---

### 2.1 List sessions (Admin / Calendar / Dashboard)

```
GET /api/admin/sessions
GET /api/admin/sessions?courseId=<courseId>
GET /api/admin/sessions?teacherId=<teacherId>
```

**Auth:** Admin

**Query (optional):**

| Param | Description |
|---|---|
| `courseId` | Filter by course |
| `teacherId` | Filter by instructor (Teacher `_id`) |

**Success `200`:**

```json
{
  "success": true,
  "count": 1,
  "sessions": [
    {
      "_id": "66f1a1b2c3d4e5f678901234",
      "title": "Physics Chapter 4",
      "topic": "Newton Laws",
      "courseId": "66aa11111111111111111111",
      "teacherId": "66bb22222222222222222222",
      "course": {
        "_id": "66aa11111111111111111111",
        "title": "Physics",
        "board": "Olevel GCE Cambridge",
        "code": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
        "serialNumber": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
        "description": "O Level Physics",
        "isActive": true
      },
      "instructor": { "_id": "66bb22222222222222222222", "name": "Ali Khan" },
      "teacher": { "_id": "66bb22222222222222222222", "name": "Ali Khan" },
      "startTime": "2026-09-15T10:00:00.000Z",
      "endTime": "2026-09-15T11:00:00.000Z",
      "duration": "60 mins",
      "type": "Regular Class",
      "status": "Scheduled",
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "description": "Agenda notes",
      "createdAt": "2026-09-14T08:00:00.000Z"
    }
  ]
}
```

Empty list bhi hamesha `{ "sessions": [] }` hoti hai, kabhi `undefined` nahi. Sort: `startTime` ascending.

---

### 2.2 Fallback list (Calendar)

```
GET /api/sessions
GET /api/sessions?courseId=<courseId>
GET /api/sessions?teacherId=<teacherId>
```

**Auth:** koi bhi logged-in user

| Role | Data |
|---|---|
| Admin | Saari sessions (`teacherId` query optional) |
| Teacher | Sirf us instructor ki sessions |
| Student | Enrolled courses ki sessions |

Response shape same as `GET /api/admin/sessions`.

---

### 2.3 Create scheduled class (Calendar — primary path)

```
POST /api/admin/sessions
```

**Auth:** Admin

**Request body (Calendar actually sends this):**

```json
{
  "title": "Physics Chapter 4",
  "courseId": "66aa11111111111111111111",
  "teacherId": "66bb22222222222222222222",
  "topic": "Physics Chapter 4",
  "startTime": "2026-09-15T10:00",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "type": "Regular Class",
  "duration": "60 mins",
  "description": "Agenda / notes"
}
```

**Required:** `title`, `courseId`, `teacherId`, `startTime`  
**Optional:** `topic`, `meetingLink`, `type`, `duration`, `description`, `endTime`, `status`  
**Do not send:** `perClassFee`, `endTime` (optional)

`startTime` ISO datetime ho sakti hai with or without `Z` (`2026-09-15T10:00` accepted).

**Success `201`:**

```json
{
  "message": "Session created",
  "session": {
    "_id": "66f1a1b2c3d4e5f678901234",
    "title": "Physics Chapter 4",
    "topic": "Physics Chapter 4",
    "courseId": "66aa11111111111111111111",
    "teacherId": "66bb22222222222222222222",
    "course": {
      "_id": "66aa11111111111111111111",
      "title": "Physics",
      "board": "Olevel GCE Cambridge",
      "code": "PHYSICS-OLEVEL-GCE-CAMBRIDGE"
    },
    "instructor": { "_id": "66bb22222222222222222222", "name": "Ali Khan" },
    "teacher": { "_id": "66bb22222222222222222222", "name": "Ali Khan" },
    "startTime": "2026-09-15T10:00:00.000Z",
    "endTime": "2026-09-15T11:00:00.000Z",
    "duration": "60 mins",
    "type": "Regular Class",
    "status": "Scheduled",
    "meetingLink": "https://meet.google.com/abc-defg-hij",
    "description": "Agenda / notes"
  }
}
```

`session._id` zaroori hai — frontend isi ko calendar event id banata hai.

**Errors:**

| Status | When |
|---|---|
| `400` | missing fields, invalid ObjectId, invalid `startTime` / `type` / `duration` / `status` |
| `404` | course ya teacher nahi mila |
| `401` / `403` | token missing ya admin nahi |

---

### 2.4 Create session (legacy form `/create-session`)

Same endpoint: `POST /api/admin/sessions`

```json
{
  "title": "Weekly Physics",
  "courseId": "66aa11111111111111111111",
  "teacherId": "66bb22222222222222222222",
  "topic": "Kinematics",
  "startTime": "2026-09-15T10:00",
  "meetingLink": "https://meet.google.com/abc-defg-hij",
  "type": "Regular Class"
}
```

`duration` na ho to `60 mins` + `endTime` auto. `status` default `Scheduled`.

---

### 2.5 Update session status (All Sessions page)

Frontend pehle PUT try karta hai, fail pe PATCH. **Dono implemented hain.**

```
PUT  /api/admin/sessions/:id
PATCH /api/admin/sessions/:id
```

**Auth:** Admin

**Request:**

```json
{
  "status": "conducted"
}
```

ya

```json
{
  "status": "not_conducted"
}
```

Allowed write values: `Scheduled` | `conducted` | `not_conducted` | `Cancelled` | `ongoing` (+ aliases upar).

**Success `200`:**

```json
{
  "message": "Status updated",
  "session": {
    "_id": "66f1a1b2c3d4e5f678901234",
    "status": "conducted",
    "title": "Physics Chapter 4",
    "courseId": "66aa11111111111111111111",
    "teacherId": "66bb22222222222222222222"
  }
}
```

`session` full formatted object hota hai (course/instructor populated).

**Errors:** `400` missing/invalid status, `404` session not found.

---

### 2.6 Teacher sessions

```
GET /api/teacher/sessions
GET /api/teacher/sessions?courseId=<courseId>
```

**Auth:** Teacher

Sirf logged-in teacher (`instructor = profileId`) ki sessions. Admin calendar pe create ki hui class yahan tab aati hai jab `teacherId` usi teacher ka `_id` ho.

**Success `200`:**

```json
{
  "success": true,
  "count": 1,
  "sessions": [
    {
      "_id": "66f1a1b2c3d4e5f678901234",
      "title": "Physics Chapter 4",
      "startTime": "2026-09-15T10:00:00.000Z",
      "endTime": "2026-09-15T11:00:00.000Z",
      "status": "Scheduled",
      "type": "Regular Class",
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "course": { "_id": "66aa11111111111111111111", "title": "Physics" },
      "instructor": { "_id": "66bb22222222222222222222", "name": "Ali Khan" }
    }
  ]
}
```

---

### 2.7 Student sessions

```
GET /api/student/students-sessions
```

**Auth:** Student

Sirf un courses ki sessions jahan student enrolled hai (`StudentCourse`, dropped nahi).

**Success `200`:**

```json
{
  "success": true,
  "count": 1,
  "sessions": [
    {
      "_id": "66f1a1b2c3d4e5f678901234",
      "course": { "_id": "66aa11111111111111111111", "title": "Physics" },
      "instructor": { "name": "Ali Khan" },
      "teacher": { "name": "Ali Khan" },
      "startTime": "2026-09-15T10:00:00.000Z",
      "endTime": "2026-09-15T11:00:00.000Z",
      "status": "Scheduled",
      "meetingLink": "https://meet.google.com/abc-defg-hij",
      "duration": "60 mins",
      "type": "Regular Class"
    }
  ]
}
```

Student UI `endTime` display karti hai — backend hamesha duration se generate karke bhejta hai.

Empty enrollments:

```json
{ "success": true, "count": 0, "sessions": [] }
```

---

## 3. Supporting APIs (calendar dropdowns)

### 3.1 Courses list

```
GET /api/admin/courses
```

**Auth:** Admin

```json
{
  "courses": [
    {
      "_id": "66aa11111111111111111111",
      "title": "Physics",
      "board": "Olevel GCE Cambridge",
      "code": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
      "courseCode": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
      "serialNumber": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
      "description": "O Level Physics",
      "isActive": true,
      "instructor": { "_id": "66bb22222222222222222222", "name": "Ali Khan" },
      "students": [],
      "studentCount": 0
    }
  ]
}
```

`code` aur `courseCode` same value hain. Purane courses jin pe `code` nahi, unka `serialNumber` alias ho kar aata hai.

---

### 3.2 Course detail

```
GET /api/admin/courses/:id
```

**Auth:** Admin

`:id` Mongo `_id` **ya** `code` / `serialNumber` ho sakta hai.

**Success `200`:** `{ "course": { ...same fields as list item... } }`  
**Error `404`:** `{ "message": "Course not found" }`

---

### 3.3 Create course

```
POST /api/admin/courses
```

JSON ya `multipart/form-data` (agar `courseImage` file ho).

**Request (frontend Add Course actually sends):**

```json
{
  "title": "Physics",
  "description": "O Level Physics",
  "board": "Olevel GCE Cambridge",
  "code": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
  "serialNumber": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
  "courseCode": "PHYSICS-OLEVEL-GCE-CAMBRIDGE"
}
```

**Required:** `title`, `description`  
**Optional:** `board`, `code`, `courseCode`, `serialNumber`, `feePKR`, `feeUSD`, `perHourFee`, `otherBoard`, `courseImage`

Agar `code` na ho to server `title + board` se generate karta hai. `serialNumber` missing ho to `code` use hota hai.

**Rules:**

- `code` / `serialNumber` unique
- `title + board` unique (case-insensitive) — Physics O-Level aur Physics A-Level alag courses

**Success `201`:**

```json
{
  "message": "Course created successfully",
  "course": {
    "_id": "66aa11111111111111111111",
    "title": "Physics",
    "board": "Olevel GCE Cambridge",
    "code": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
    "courseCode": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
    "serialNumber": "PHYSICS-OLEVEL-GCE-CAMBRIDGE",
    "description": "O Level Physics",
    "isActive": true
  }
}
```

**Error `409`:** duplicate title+board ya duplicate code.

---

### 3.4 Update course

```
PUT /api/admin/courses/:id
```

Same payload as create. Same uniqueness rules (current course exclude).

**Success `200`:** `{ "message": "Course updated successfully", "course": { ... } }`

---

### 3.5 Teachers list

```
GET /api/admin/teachers
```

**Auth:** Admin

```json
{
  "teachers": [
    {
      "_id": "66bb22222222222222222222",
      "name": "Ali Khan",
      "email": "ali@school.com",
      "assignedCourses": ["66aa11111111111111111111"]
    }
  ]
}
```

`assignedCourses` populated objects bhi ho sakte hain (`title`, `description`, ...). Calendar ko `_id` + `name` chahiye.

Calendar create pe `teacherId` = teacher document ka `_id` (profile id), Auth id nahi.

---

## 4. Session model (Mongo)

```js
{
  title: String,                 // required
  topic: String,
  course: ObjectId (Course),     // required, API me courseId
  instructor: ObjectId (Teacher),// required, API me teacherId
  startTime: Date,               // required
  endTime: Date,                 // optional, auto from duration
  duration: "45 mins" | "60 mins" | "90 mins" | "120 mins",
  type: "Regular Class" | "Extra Class",
  status: "Scheduled" | "conducted" | "not_conducted" | "Cancelled" | "ongoing" | "pending" | "completed",
  meetingLink: String,
  description: String,
  perClassFee: Number            // optional, payroll only, create pe required nahi
}
```

Create flow:

1. Validate `courseId` + `teacherId` exist
2. `type` sirf Regular / Extra
3. Default `status = "Scheduled"`
4. `endTime` missing ho to `startTime + duration`
5. Return populated session with `_id`
6. HTTP `201`

---

## 5. Role visibility

Admin-created calendar sessions yahan dikhti hain:

- Admin calendar → `GET /api/admin/sessions`
- Admin sessions page → same
- Teacher → `GET /api/teacher/sessions` (assigned instructor)
- Student → `GET /api/student/students-sessions` (enrolled course)

---

## 6. Checklist

- [x] `POST /api/admin/sessions` `endTime` aur `perClassFee` required nahi
- [x] `type` enum: `Regular Class` | `Extra Class`
- [x] `status` create default: `Scheduled`
- [x] `PUT` + `PATCH /api/admin/sessions/:id` body `{ status }` save kare
- [x] `GET /api/admin/sessions` populated `course` + `instructor`/`teacher`
- [x] Response key `sessions` array
- [x] Created session `_id` return
- [x] Teacher/student lists same records
- [x] Courses `board` + unique `code` save
- [x] `GET /api/sessions` fallback
- [x] `GET /api/admin/courses/:id`

---

## 7. Frontend files that must stay in sync

- `src/pages/mypages/ClassCalendar.jsx`
- `src/pages/mypages/SessionCreate.jsx`
- `src/components/mycomponents/teacher/SessionsList.jsx`
- `src/components/mycomponents/admin/NumberOfClassesChart.jsx`
- `src/utils/lmsData.js`
- `src/api/axiosInstance.js` (`baseURL`)
