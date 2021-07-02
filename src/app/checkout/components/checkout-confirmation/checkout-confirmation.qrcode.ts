import SwissQRBill from 'swissqrbill/lib/browser';
import * as utils from "./utils";

export function generateQRCode(data: SwissQRBill.data): string {

    //-- Validate reference
    let referenceType = "QRR";
    if (utils.isQRIBAN(data.creditor.account)) {
        if (data.reference !== undefined) {
            if (utils.isQRReference(data.reference)) {
                referenceType = "QRR";
            }
        }
    } else {
        if (data.reference === undefined) {
            referenceType = "NON";
        } else {
            if (!utils.isQRReference(data.reference)) {
                referenceType = "SCOR";
            }
        }
    }

    let qrString = "";

    //-- Swiss Payments Code
    qrString += "SPC";

    //-- Version
    qrString += "\n0200";

    //-- Coding Type UTF-8
    qrString += "\n1";

    //-- IBAN
    qrString += "\n" + data.creditor.account ?? "\n";

    //-- Creditor
    if (data.creditor.houseNumber !== undefined) {
        // Address Type
        qrString += "\nS";
        // Name
        qrString += "\n" + data.creditor.name;
        // Address
        qrString += "\n" + data.creditor.address;
        // House number
        qrString += "\n" + data.creditor.houseNumber;
        // Zip
        qrString += "\n" + data.creditor.zip;
        // City
        qrString += "\n" + data.creditor.city;
    } else {
        // Address Type
        qrString += "\nK";
        // Name
        qrString += "\n" + data.creditor.name;
        // Address
        qrString += "\n" + data.creditor.address;
        // Zip + city
        if ((data.creditor.zip + " " + data.creditor.city).length > 70) {
            throw new Error(
                "Creditor zip plus city must be a maximum of 70 characters."
            );
        }
        qrString += "\n" + data.creditor.zip + " " + data.creditor.city;
        // Empty zip field
        qrString += "\n";
        // Empty city field
        qrString += "\n";
    }
    qrString += "\n" + data.creditor.country;

    //-- 7 x empty
    qrString += "\n"; // 1
    qrString += "\n"; // 2
    qrString += "\n"; // 3
    qrString += "\n"; // 4
    qrString += "\n"; // 5
    qrString += "\n"; // 6
    qrString += "\n"; // 7

    //-- Amount
    if (data.amount !== undefined) {
        qrString += "\n" + data.amount.toFixed(2);
    } else {
        qrString += "\n";
    }

    //-- Currency
    qrString += "\n" + data.currency;

    //-- Debtor
    if (data.debtor !== undefined) {
        if (data.debtor.houseNumber !== undefined) {
            // Address type
            qrString += "\nS";
            // Name
            qrString += "\n" + data.debtor.name;
            // Address
            qrString += "\n" + data.debtor.address;
            // House number
            qrString += "\n" + data.debtor.houseNumber;
            // Zip
            qrString += "\n" + data.debtor.zip;
            // City
            qrString += "\n" + data.debtor.city;
        } else {
            // Address type
            qrString += "\nK";
            // Name
            qrString += "\n" + data.debtor.name;
            // Address
            qrString += "\n" + data.debtor.address;
            // Zip + city
            if ((data.debtor.zip + " " + data.debtor.city).length > 70) {
                throw new Error(
                    "Debtor zip plus city must be a maximum of 70 characters."
                );
            }
            qrString += "\n" + data.debtor.zip + " " + data.debtor.city;
            // Empty field zip
            qrString += "\n";
            // Empty field city
            qrString += "\n";
        }
        // Country
        qrString += "\n" + data.debtor.country;
    } else {
        // Empty field type
        qrString += "\n";
        // Empty field name
        qrString += "\n";
        // Empty field address
        qrString += "\n";
        // Empty field house number
        qrString += "\n";
        // Empty field zip
        qrString += "\n";
        // Empty field city
        qrString += "\n";
        // Empty field country
        qrString += "\n";
    }

    //-- Reference type
    qrString += "\n" + referenceType;

    //-- Reference
    if (data.reference !== undefined) {
        qrString += "\n" + data.reference;
    } else {
        qrString += "\n";
    }

    //-- Unstructured message
    if (data.message !== undefined) {
        qrString += "\n" + data.message;
    } else {
        qrString += "\n";
    }

    //-- End Payment Data
    qrString += "\n" + "EPD";

    //-- Additional information
    if (data.additionalInformation !== undefined) {
        qrString += "\n" + data.additionalInformation;
    } else {
        qrString += "\n";
    }

    //-- AV1
    if (data.av1 !== undefined) {
        qrString += "\n" + data.av1;
    }
    if (data.av2 !== undefined) {
        qrString += "\n" + data.av2;
    }

    return qrString;
}
