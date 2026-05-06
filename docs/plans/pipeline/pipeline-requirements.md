# Student Application Pipeline — What It Does

---

## The database holds the foundation

Three tables sit at the core of everything. The `universities` table stores every university the app knows about, including the admissions email address that the pipeline depends on to send applications. The `application_requirements` table stores the list of documents each university expects from applicants — things like transcripts, passport copies, language certificates, and motivation letters. The `application_history` table records every application a student has submitted, so they can look back at what they sent and when.

None of this works without data in those tables. Universities need admissions emails populated. Requirements need to be extracted from each university's admissions page and stored before any student can use the pipeline.

---

## A seed process populates requirements automatically

Before students ever use the app, a background seed process visits each university's admissions page on the web, reads the content, understands what documents the university is asking for, and saves a structured list of those requirements into the database. It does this for every university, skipping ones that already have requirements stored. For universities where the admissions page is inaccessible, requirements are entered manually.

From that point forward, when a new university is added to the app, its requirements get extracted and stored the same way — automatically, as part of adding the university.

---

## A button appears only when applying is possible

On every university detail page, the app checks whether that university has an admissions email stored in the database. If it does, an Apply Now button appears. If it doesn't, a note appears instead explaining that no application contact is available. There is no way to start the application process without a destination to send it to.

---

## Clicking Apply opens a three-stage guided process

The student lands on a dedicated page for that university. The page walks them through three stages in order — they cannot skip ahead.

### Stage 1 — The student sees exactly what they need to prepare

The app reads the stored requirements for that university and presents them as a clean, readable checklist grouped into categories: identity documents, academic records, language certificates, financial documents, and anything else. Each item shows whether it is required or optional, what format it should be in, and any specific notes the university specified. The student reads through the list, confirms they have everything, and continues.

### Stage 2 — The student uploads their documents and fills in their details

The page shows one upload field for every required document, labelled exactly as the requirement states. The student attaches each file. They also fill in their full name, the school or university they currently attend, the programme they are applying for, and a short personal statement of a few sentences. When they click Continue, the app checks that every required file is attached, that the files are the right type, and that the files are not too large. If anything is missing or wrong, the relevant field shows an error message and the student stays on the same stage until it is fixed.

### Stage 3 — A professional application email is composed and ready to send

Using everything the student provided — their name, the programme, the personal statement, and the list of documents they uploaded — the app writes a formal application email addressed to the university. The student sees the full email before it goes anywhere: the recipient address, the subject line, and the complete body. They can edit the body if they want to change the wording. When they are happy with it, they click a button that opens their own email client with the subject and body already filled in. A clear reminder tells them to attach the uploaded files before hitting send. Once they click the send button in their email client, the application is on its way.

---

## Every application is saved to the student's history

The moment the student opens their email client, the app saves a record of that application — the university name, the programme, the date, the list of documents, and the email subject. The student can visit a My Applications page at any time to see every application they have submitted from that device, with the option to remove entries they no longer need.

---

## What the process achieves from start to finish

A student finds a university they want to apply to. They click one button. They are shown exactly what documents are required. They upload those documents and describe themselves in a few sentences. A complete, professional application email is written for them. They send it from their own email account. The whole process takes a few minutes and requires no prior knowledge of what the university expects or how to write a formal application email.

The university receives a well-structured email from the student's own address, with all required documents attached, addressed correctly to their admissions team.