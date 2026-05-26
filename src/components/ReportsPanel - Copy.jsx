import React, { useState } from "react";
import { formatINR } from "../utils";
import { Bar, Line, Pie } from "react-chartjs-2";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// import * as XLSX from "xlsx";
import ExcelJS from "exceljs";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

export default function ReportsPanel() {
  const students = [
    {
      "id": 7,
      "admissionNumber": "ADM007",
      "admissionDate": "2025-04-01",
      "className": "Playgroup / Toddler",
      "firstName": "Suman",
      "surname": "kumari",
      "gender": "Female",
      "dob": "2021-11-01",
      "placeOfBirth": "Ranchi",
      "nationality": "Indian",
      "religion": "",
      "bloodGroup": "B+",
      "height": "5",
      "weight": "13",
      "homeLanguage": "",
      "previousSchool": "",
      "studentImage": "",
      "mobile": "",
      "email": "abc@gmail.com",
      "homeAddress": "ranchi",
      "address": "",
      "fatherName": "Suresh Kumar",
      "fatherOccupation": "Business",
      "fatherContact": "9334818304",
      "motherName": "Bimla Devi",
      "motherOccupation": "Home Maker",
      "motherContact": "",
      "emergencyName": "Manoj Kumar",
      "emergencyPhone": "09876543210",
      "emergencyRelation": "mother",
      "medicalInfo": "terstf",
      "medication": "Yes",
      "fatherPhoto": "",
      "fatherAadhaar": "",
      "motherPhoto": "",
      "motherAadhaar": "",
      "username": "student3",
      "password": "12345",
      "payments": [
        {
          "id": 23,
          "paymentDate": "2025-03-17",
          "paymentMode": "UPI",
          "monthName": "April",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 30,
          "paymentDate": null,
          "paymentMode": null,
          "monthName": "November",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 10000,
          "admissionFee": 37000,
          "admissionFormFee": 2000,
          "registrationFee": null,
          "cautionFee": 6526,
          "monthlyFee": 5500,
          "annualFee": 23525,
          "fineAmount": null,
          "enrichmentActivityFee": null,
          "additionalFee": null,
          "paidAmount": null,
          "remainingAmount": 8000,
          "year": null,
          "totalAmount": 56000,
          "paymentStatus": "Unpaid"
        },
        {
          "id": 25,
          "paymentDate": "2025-01-11",
          "paymentMode": "Cash",
          "monthName": "June",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 26,
          "paymentDate": "2025-04-15",
          "paymentMode": "Cash",
          "monthName": "July",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 27,
          "paymentDate": "2025-05-14",
          "paymentMode": "Cash",
          "monthName": "August",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 29,
          "paymentDate": "2025-07-12",
          "paymentMode": "Cash",
          "monthName": "October",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 1500,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 45500,
          "paymentStatus": "Paid"
        },
        {
          "id": 24,
          "paymentDate": "2025-02-13",
          "paymentMode": "Cash",
          "monthName": "May",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 28,
          "paymentDate": "2025-06-15",
          "paymentMode": "Cash",
          "monthName": "September",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        }
      ]
    },
    {
      "id": 3,
      "admissionNumber": "ADM0033",
      "admissionDate": "2025-04-06",
      "className": "Playgroup / Toddler",
      "firstName": "Naima",
      "surname": "kumari",
      "gender": "Female",
      "dob": "2022-02-23",
      "placeOfBirth": "Ranchi",
      "nationality": "Indian",
      "religion": "",
      "bloodGroup": "B+",
      "height": "5",
      "weight": "13",
      "homeLanguage": "",
      "previousSchool": "",
      "studentImage": "",
      "mobile": "",
      "email": "abc@gmail.com",
      "homeAddress": "ranchi",
      "address": "",
      "fatherName": "Suresh Kumar",
      "fatherOccupation": "Business",
      "fatherContact": "9334818304",
      "motherName": "Sanjana Singh",
      "motherOccupation": "Home Maker",
      "motherContact": "",
      "emergencyName": "Sumit Singh",
      "emergencyPhone": "09876543210",
      "emergencyRelation": "mother",
      "medicalInfo": "terst",
      "medication": "Yes",
      "fatherPhoto": "",
      "fatherAadhaar": "",
      "motherPhoto": "",
      "motherAadhaar": "",
      "username": "student2",
      "password": "student2",
      "payments": [
        {
          "id": 9,
          "paymentDate": "2025-09-15",
          "paymentMode": "UPI",
          "monthName": "September",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 10,
          "paymentDate": "2025-10-15",
          "paymentMode": "UPI",
          "monthName": "October",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 7,
          "paymentDate": "2025-07-12",
          "paymentMode": "UPI",
          "monthName": "July",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 11,
          "paymentDate": null,
          "paymentMode": null,
          "monthName": "November",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 39999,
          "admissionFee": 37000,
          "admissionFormFee": 235,
          "registrationFee": null,
          "cautionFee": 6526,
          "monthlyFee": 5500,
          "annualFee": 23525,
          "fineAmount": null,
          "enrichmentActivityFee": null,
          "additionalFee": null,
          "paidAmount": null,
          "remainingAmount": 7000,
          "year": null,
          "totalAmount": 7000,
          "paymentStatus": "Unpaid"
        },
        {
          "id": 1,
          "paymentDate": "2025-03-17",
          "paymentMode": null,
          "monthName": "March",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 1500,
          "admissionFee": 37000,
          "admissionFormFee": null,
          "registrationFee": null,
          "cautionFee": null,
          "monthlyFee": null,
          "annualFee": null,
          "fineAmount": null,
          "enrichmentActivityFee": null,
          "additionalFee": null,
          "paidAmount": 7000,
          "remainingAmount": null,
          "year": 2025,
          "totalAmount": 45500,
          "paymentStatus": "Paid"
        },
        {
          "id": 2,
          "paymentDate": "2025-02-13",
          "paymentMode": null,
          "monthName": "February",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": null,
          "admissionFee": 37000,
          "admissionFormFee": null,
          "registrationFee": null,
          "cautionFee": null,
          "monthlyFee": null,
          "annualFee": null,
          "fineAmount": null,
          "enrichmentActivityFee": null,
          "additionalFee": null,
          "paidAmount": 7000,
          "remainingAmount": null,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 3,
          "paymentDate": "2025-01-11",
          "paymentMode": null,
          "monthName": "January",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": null,
          "admissionFee": 37000,
          "admissionFormFee": null,
          "registrationFee": null,
          "cautionFee": null,
          "monthlyFee": null,
          "annualFee": null,
          "fineAmount": null,
          "enrichmentActivityFee": null,
          "additionalFee": null,
          "paidAmount": 7000,
          "remainingAmount": null,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 4,
          "paymentDate": "2025-04-15",
          "paymentMode": "UPI",
          "monthName": "April",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 5,
          "paymentDate": "2025-05-14",
          "paymentMode": "UPI",
          "monthName": "May",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 6,
          "paymentDate": "2025-06-15",
          "paymentMode": "UPI",
          "monthName": "June",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 8,
          "paymentDate": "2025-08-15",
          "paymentMode": "UPI",
          "monthName": "August",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 1500,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 45500,
          "paymentStatus": "Paid"
        }
      ]
    },
    {
      "id": 4,
      "admissionNumber": "ADM00433",
      "admissionDate": "2025-04-14",
      "className": "Nursery",
      "firstName": "Ranjan",
      "surname": "Singh",
      "gender": "Male",
      "dob": "2022-04-06",
      "placeOfBirth": "Ranchi",
      "nationality": "Indian",
      "religion": "Hindu",
      "bloodGroup": "o+",
      "height": "5",
      "weight": "15",
      "homeLanguage": "HIndi",
      "previousSchool": "P School",
      "studentImage": "",
      "mobile": "09876543210",
      "email": "siddique2222@gmail.com",
      "homeAddress": "ranchi",
      "address": "ranchi",
      "fatherName": "RAJIVA NARAYAN",
      "fatherOccupation": "Manager",
      "fatherContact": "9065927066",
      "motherName": "Meena Verma",
      "motherOccupation": "job",
      "motherContact": "88888888888",
      "emergencyName": "Sumit Singh",
      "emergencyPhone": "09876543210",
      "emergencyRelation": "father",
      "medicalInfo": "No",
      "medication": "Yes",
      "fatherPhoto": "",
      "fatherAadhaar": "",
      "motherPhoto": "",
      "motherAadhaar": "",
      "username": "student1",
      "password": "12345",
      "payments": [
        {
          "id": 12,
          "paymentDate": "2025-03-17",
          "paymentMode": "UPI",
          "monthName": "March",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": null,
          "admissionFee": 37000,
          "admissionFormFee": null,
          "registrationFee": null,
          "cautionFee": null,
          "monthlyFee": null,
          "annualFee": null,
          "fineAmount": null,
          "enrichmentActivityFee": null,
          "additionalFee": null,
          "paidAmount": 7000,
          "remainingAmount": null,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 21,
          "paymentDate": "2025-10-15",
          "paymentMode": "UPI",
          "monthName": "October",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 19,
          "paymentDate": "2025-08-15",
          "paymentMode": "UPI",
          "monthName": "August",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 22,
          "paymentDate": null,
          "paymentMode": null,
          "monthName": "November",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 39999,
          "admissionFee": 37000,
          "admissionFormFee": 235,
          "registrationFee": null,
          "cautionFee": 6526,
          "monthlyFee": 5500,
          "annualFee": 23525,
          "fineAmount": null,
          "enrichmentActivityFee": null,
          "additionalFee": null,
          "paidAmount": null,
          "remainingAmount": 8000,
          "year": null,
          "totalAmount": 7000,
          "paymentStatus": "Unpaid"
        },
        {
          "id": 20,
          "paymentDate": "2025-09-15",
          "paymentMode": "Cash",
          "monthName": "September",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 16,
          "paymentDate": "2025-05-14",
          "paymentMode": "Cash",
          "monthName": "May",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 17,
          "paymentDate": "2025-06-15",
          "paymentMode": "Cash",
          "monthName": "June",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 18,
          "paymentDate": "2025-07-12",
          "paymentMode": "Cash",
          "monthName": "July",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 15,
          "paymentDate": "2025-04-15",
          "paymentMode": "UPI",
          "monthName": "April",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": 150,
          "admissionFee": 37000,
          "admissionFormFee": 0,
          "registrationFee": 0,
          "cautionFee": 0,
          "monthlyFee": 2500,
          "annualFee": 0,
          "fineAmount": 0,
          "enrichmentActivityFee": 0,
          "additionalFee": 0,
          "paidAmount": 7000,
          "remainingAmount": 0,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 14,
          "paymentDate": "2025-01-11",
          "paymentMode": "UPI",
          "monthName": "January",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": null,
          "admissionFee": 37000,
          "admissionFormFee": null,
          "registrationFee": null,
          "cautionFee": null,
          "monthlyFee": null,
          "annualFee": null,
          "fineAmount": null,
          "enrichmentActivityFee": null,
          "additionalFee": null,
          "paidAmount": 7000,
          "remainingAmount": null,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        },
        {
          "id": 13,
          "paymentDate": "2025-02-13",
          "paymentMode": "UPI",
          "monthName": "February",
          "tuitionFee": 5500,
          "transportFee": 1500,
          "uniformFee": null,
          "childKitFee": null,
          "admissionFee": 37000,
          "admissionFormFee": null,
          "registrationFee": null,
          "cautionFee": null,
          "monthlyFee": null,
          "annualFee": null,
          "fineAmount": null,
          "enrichmentActivityFee": null,
          "additionalFee": null,
          "paidAmount": 7000,
          "remainingAmount": null,
          "year": 2025,
          "totalAmount": 7000,
          "paymentStatus": "Paid"
        }
      ]
    },
    {
      "id": 13,
      "admissionNumber": null,
      "admissionDate": null,
      "className": null,
      "firstName": null,
      "surname": null,
      "gender": null,
      "dob": null,
      "placeOfBirth": null,
      "nationality": null,
      "religion": null,
      "bloodGroup": null,
      "height": null,
      "weight": null,
      "homeLanguage": null,
      "previousSchool": null,
      "studentImage": null,
      "mobile": null,
      "email": null,
      "homeAddress": null,
      "address": null,
      "fatherName": null,
      "fatherOccupation": null,
      "fatherContact": null,
      "motherName": null,
      "motherOccupation": null,
      "motherContact": null,
      "emergencyName": null,
      "emergencyPhone": null,
      "emergencyRelation": null,
      "medicalInfo": null,
      "medication": null,
      "fatherPhoto": null,
      "fatherAadhaar": null,
      "motherPhoto": null,
      "motherAadhaar": null,
      "username": null,
      "password": null,
      "payments": []
    },
    {
      "id": 14,
      "admissionNumber": null,
      "admissionDate": null,
      "className": null,
      "firstName": "jay",
      "surname": "kumar",
      "gender": "Male",
      "dob": "2025-12-03",
      "placeOfBirth": "Bihar",
      "nationality": "Indian",
      "religion": null,
      "bloodGroup": "o+",
      "height": "23",
      "weight": "55",
      "homeLanguage": "English",
      "previousSchool": "Dps",
      "studentImage": null,
      "mobile": "123456789",
      "email": "xemined528@foxroids.com",
      "homeAddress": "son",
      "address": null,
      "fatherName": null,
      "fatherOccupation": null,
      "fatherContact": null,
      "motherName": null,
      "motherOccupation": null,
      "motherContact": null,
      "emergencyName": null,
      "emergencyPhone": null,
      "emergencyRelation": null,
      "medicalInfo": null,
      "medication": null,
      "fatherPhoto": null,
      "fatherAadhaar": null,
      "motherPhoto": null,
      "motherAadhaar": null,
      "username": "jay14",
      "password": "jay980",
      "payments": []
    },
    {
      "id": 15,
      "admissionNumber": null,
      "admissionDate": null,
      "className": null,
      "firstName": "jay",
      "surname": "kumar",
      "gender": "Male",
      "dob": "2025-12-10",
      "placeOfBirth": "ranchi",
      "nationality": "Indian",
      "religion": null,
      "bloodGroup": "o+",
      "height": "23",
      "weight": "23",
      "homeLanguage": "Hindi",
      "previousSchool": "",
      "studentImage": null,
      "mobile": "1234567",
      "email": "xemined528@foxroids.com",
      "homeAddress": "Bihar",
      "address": null,
      "fatherName": null,
      "fatherOccupation": null,
      "fatherContact": null,
      "motherName": null,
      "motherOccupation": null,
      "motherContact": null,
      "emergencyName": null,
      "emergencyPhone": null,
      "emergencyRelation": null,
      "medicalInfo": null,
      "medication": null,
      "fatherPhoto": null,
      "fatherAadhaar": null,
      "motherPhoto": null,
      "motherAadhaar": null,
      "username": "jay15",
      "password": "jay985",
      "payments": []
    },
    {
      "id": 16,
      "admissionNumber": null,
      "admissionDate": null,
      "className": null,
      "firstName": "jay",
      "surname": "kumar",
      "gender": null,
      "dob": null,
      "placeOfBirth": null,
      "nationality": null,
      "religion": null,
      "bloodGroup": null,
      "height": null,
      "weight": null,
      "homeLanguage": null,
      "previousSchool": null,
      "studentImage": null,
      "mobile": null,
      "email": null,
      "homeAddress": null,
      "address": null,
      "fatherName": null,
      "fatherOccupation": null,
      "fatherContact": null,
      "motherName": null,
      "motherOccupation": null,
      "motherContact": null,
      "emergencyName": null,
      "emergencyPhone": null,
      "emergencyRelation": null,
      "medicalInfo": null,
      "medication": null,
      "fatherPhoto": null,
      "fatherAadhaar": null,
      "motherPhoto": null,
      "motherAadhaar": null,
      "username": "jay16",
      "password": "jay545",
      "payments": []
    },
    {
      "id": 17,
      "admissionNumber": null,
      "admissionDate": null,
      "className": null,
      "firstName": "jay",
      "surname": "kumar",
      "gender": "Male",
      "dob": null,
      "placeOfBirth": null,
      "nationality": null,
      "religion": null,
      "bloodGroup": null,
      "height": null,
      "weight": null,
      "homeLanguage": null,
      "previousSchool": null,
      "studentImage": null,
      "mobile": null,
      "email": null,
      "homeAddress": null,
      "address": null,
      "fatherName": null,
      "fatherOccupation": null,
      "fatherContact": null,
      "motherName": null,
      "motherOccupation": null,
      "motherContact": null,
      "emergencyName": null,
      "emergencyPhone": null,
      "emergencyRelation": null,
      "medicalInfo": null,
      "medication": null,
      "fatherPhoto": null,
      "fatherAadhaar": null,
      "motherPhoto": null,
      "motherAadhaar": null,
      "username": "jay17",
      "password": "jay981",
      "payments": []
    },
    {
      "id": 5,
      "admissionNumber": "TEACH001",
      "admissionDate": "2025-04-14",
      "className": "",
      "firstName": "Maan",
      "surname": "Singh",
      "gender": "Male",
      "dob": "1995-04-06",
      "placeOfBirth": "Ranchi",
      "nationality": "Indian",
      "religion": "Hindu",
      "bloodGroup": "o+",
      "height": "5.6",
      "weight": "65",
      "homeLanguage": "HIndi",
      "previousSchool": "P School",
      "studentImage": "",
      "mobile": "09162457210",
      "email": "teacher@gmail.com",
      "homeAddress": "ranchi",
      "address": "ranchi",
      "fatherName": "PAAN SINGH",
      "fatherOccupation": "Analyst",
      "fatherContact": "9065927066",
      "motherName": "Meera Singh",
      "motherOccupation": "job",
      "motherContact": "88888888888",
      "emergencyName": "Maan Singh",
      "emergencyPhone": "09162457210",
      "emergencyRelation": "father",
      "medicalInfo": "No",
      "medication": "Yes",
      "fatherPhoto": "",
      "fatherAadhaar": "",
      "motherPhoto": "",
      "motherAadhaar": "",
      "username": "teacher",
      "password": "teacher123",
      "payments": []
    }
  ]
  // -------------------------------------------------
  // FIX: Fee comes from payments (not from Students)
  // -------------------------------------------------
  const totalFees = students.reduce(
    (sum, s) =>
      sum +
      (s.payments?.reduce((a, p) => a + (p.totalAmount || 0), 0) || 0),
    0
  );

  const totalCollected = students.reduce(
    (sum, s) =>
      sum +
      (s.payments?.reduce((a, p) => a + (p.paidAmount || 0), 0) || 0),
    0
  );

  const pending = totalFees - totalCollected;

  const [sortConfig, setSortConfig] = useState({ key: "pending", direction: "desc" });

  // ------------------ Demo Monthly Data ------------------
  const monthlyData = [
    { month: "Jan", collected: 10000 },
    { month: "Feb", collected: 12000 },
    { month: "Mar", collected: 8000 },
    { month: "Apr", collected: 15000 },
  ];

  const monthlyChartData = {
    labels: monthlyData.map((m) => m.month),
    datasets: [
      {
        label: "Collected Fees (₹)",
        data: monthlyData.map((m) => m.collected),
        backgroundColor: "rgba(54, 162, 235, 0.4)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  };

  const pieData = {
    labels: ["Collected", "Pending"],
    datasets: [
      {
        data: [totalCollected, pending],
        backgroundColor: ["rgba(75, 192, 192, 0.8)", "rgba(255, 99, 132, 0.8)"],
        borderWidth: 1,
      },
    ],
  };

  // ---------------- CLASS-WISE -------------------
  const classData = {};
  students.forEach((s) => {
    if (!classData[s.className]) classData[s.className] = { total: 0, paid: 0 };

    classData[s.className].total +=
      s.payments?.reduce((a, p) => a + (p.totalAmount || 0), 0) || 0;

    classData[s.className].paid +=
      s.payments?.reduce((a, p) => a + (p.paidAmount || 0), 0) || 0;
  });

  // ---------------- TOP PENDING STUDENTS -------------------
  const topPending = [...students]
    .map((s) => ({
      name: `${s.firstName} ${s.surname || ""}`, // FIXED
      className: s.className,
      pending:
        (s.payments?.reduce((a, p) => a + (p.totalAmount || 0), 0) || 0) -
        (s.payments?.reduce((a, p) => a + (p.paidAmount || 0), 0) || 0),
    }))
    .sort((a, b) => b.pending - a.pending)
    .slice(0, 5);

  // ---------------- SORTING -------------------
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      } else {
        return { key, direction: "desc" };
      }
    });
  };

  const sortedData = [...topPending].sort((a, b) => {
    const { key, direction } = sortConfig;
    if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
    if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
    return 0;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return "↕";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  // -------------------------------------------------------
  // PDF + EXCEL EXPORT FIXED (uses payments not undefined values)
  // -------------------------------------------------------

 const downloadPDF = () => {
  const doc = new jsPDF();
  const today = new Date();

  const formattedDate = today.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  doc.setFontSize(16);
  doc.text("Fee Report Summary", 14, 15);
  doc.setFontSize(10);
  doc.text(`Date: ${formattedDate}`, 200, 15, { align: "right" });

  autoTable(doc, {
    startY: 25,
    head: [["Name", "Class", "Total Fee", "Paid", "Pending"]],
    body: students.map((s) => {
      const total =
        s.payments?.reduce((a, p) => a + (p.totalAmount || 0), 0) || 0;
      const paid =
        s.payments?.reduce((a, p) => a + (p.paidAmount || 0), 0) || 0;

      return [
        `${s.firstName} ${s.surname || ""}`,
        s.className,
        `Rs. ${total.toLocaleString("en-IN")}`,
        `Rs. ${paid.toLocaleString("en-IN")}`,
        `Rs. ${(total - paid).toLocaleString("en-IN")}`,
      ];
    }),
  });

  const fileName = "Fee_Report.pdf";
  const mimeType = "application/pdf";

  if (window.AndroidDownloader) {
    console.log("Android WebView detected for PDF");

    const pdfBuffer = doc.output("arraybuffer");

    const base64Data = btoa(
      new Uint8Array(pdfBuffer).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    window.AndroidDownloader.downloadFile(
      base64Data,
      fileName,
      mimeType
    );

  } else {
    doc.save(fileName);
  }
};

  const exportToExcel = async (formattedData) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Fee Report");

    if (formattedData.length > 0) {
      worksheet.columns = Object.keys(formattedData[0]).map(key => ({
        header: key,
        key: key,
        width: 20,
      }));
    }

    formattedData.forEach(item => {
      worksheet.addRow(item);
    });

    // 🔹 Generate Excel buffer
    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = "Fee_Report.xlsx";
    const mimeType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    // 🔹 ANDROID WEBVIEW HANDLING
    if (window.AndroidDownloader) {
      console.log("Android WebView detected");

      // Convert buffer → base64
      const base64Data = btoa(
        new Uint8Array(buffer).reduce(
          (data, byte) => data + String.fromCharCode(byte),
          ""
        )
      );

      // Call native downloader
      window.AndroidDownloader.downloadFile(
        base64Data,
        fileName,
        mimeType
      );

    } else {
      // 🔹 NORMAL BROWSER DOWNLOAD
      const blob = new Blob([buffer], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);
    }
  };

  const downloadExcel = () => {
    const formattedData = students.map((s) => {
      const total =
        s.payments?.reduce((a, p) => a + (p.totalAmount || 0), 0) || 0;
      const paid =
        s.payments?.reduce((a, p) => a + (p.paidAmount || 0), 0) || 0;

      return {
        Name: `${s.firstName} ${s.surname || ""}`,
        Class: s.className,
        "Total Fee": `Rs. ${total.toLocaleString("en-IN")}`,
        Paid: `Rs. ${paid.toLocaleString("en-IN")}`,
        Pending: `Rs. ${(total - paid).toLocaleString("en-IN")}`,
      };
    });

    exportToExcel(formattedData);
  };


  return (
    <>
      {/* CHARTS */}

      <div className="report-container p-0">


        <div className="chart-section">
          <div className="col-md-6">
            <h5>Monthly Collection</h5>
            <Line data={monthlyChartData} />
          </div>
        </div>

        <div className="chart-section pie">
          <div className="col-md-6">
            <h5>Paid vs Pending</h5>
            <Pie data={pieData} />
          </div>
        </div>
      </div>

      {/* CLASS TABLE */}
      <h5 className="mt-2">Class-wise Fee Collection</h5>
      <div className="listsec syllabus-master ">
        <div className="listbox studentlist theading">
          <div>Sl.</div>
          <div>Class</div>
          <div>Total Fee</div>
          <div>Collected</div>
          <div>Pending</div>
        </div>
        <ul>
          {Object.entries(classData).map(([cls, val], i) => (
            <li key={i}>
              <div className="listbox studentlist">
                <div>{i + 1}</div>
                <div data-head="Class">{cls}</div>
                <div data-head="Total Fee">{formatINR(val.total)}</div>
                <div data-head="Collected">{formatINR(val.paid)}</div>
                <div data-head="Pending">{formatINR(val.total - val.paid)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* TOP PENDING */}
      <h5 className="mt-4">Pending Students</h5>
      <div className="listsec syllabus-master">
        <div className="listbox studentlist theading">
          <div>Sl.</div>
          <div>Name</div>
          <div onClick={() => handleSort("className")} style={{ cursor: "pointer" }}>
            Class {getSortIcon("className")}
          </div>
          <div onClick={() => handleSort("pending")} style={{ cursor: "pointer" }}>
            Pending {getSortIcon("pending")}
          </div>
        </div>
        <ul>
          {sortedData.map((s, i) => (
            <li key={i}>
              <div className="listbox studentlist">
                <div data-head="Sl">{i + 1}</div>
                <div data-head="Name">{s.name}</div>
                <div data-head="Class">{s.className}</div>
                <div data-head="Pending">{formatINR(s.pending)}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="buttongroup mt-2">
        <button className="btn btn-primary" onClick={downloadExcel}>⬇ Download Excel</button>
        <button className="btn btn-danger" onClick={downloadPDF}>⬇ Download PDF</button>
      </div>
    </>
  );
}
