import QRCode from 'qrcode';
import { parse } from 'svg-parser';
import svgpath from 'svgpath';
import SwissQRBill from 'swissqrbill/lib/browser';

import * as utils from './utils';

export function generateQRCode(data: SwissQRBill.data): string {
    // -- Validate reference
    let referenceType = 'QRR';
    if (utils.isQRIBAN(data.creditor.account)) {
        if (data.reference !== undefined) {
            if (utils.isQRReference(data.reference)) {
                referenceType = 'QRR';
            }
        }
    } else {
        if (data.reference === undefined) {
            referenceType = 'NON';
        } else {
            if (!utils.isQRReference(data.reference)) {
                referenceType = 'SCOR';
            }
        }
    }

    let qrString = '';

    // Swiss Payments Code
    qrString += 'SPC';

    // Version
    qrString += '\n0200';

    // Coding Type UTF-8
    qrString += '\n1';

    // IBAN
    qrString += '\n' + data.creditor.account ?? '\n';

    // Creditor
    if (data.creditor.houseNumber !== undefined) {
        // Address Type
        qrString += '\nS';
        // Name
        qrString += '\n' + data.creditor.name;
        // Address
        qrString += '\n' + data.creditor.address;
        // House number
        qrString += '\n' + data.creditor.houseNumber;
        // Zip
        qrString += '\n' + data.creditor.zip;
        // City
        qrString += '\n' + data.creditor.city;
    } else {
        // Address Type
        qrString += '\nK';
        // Name
        qrString += '\n' + data.creditor.name;
        // Address
        qrString += '\n' + data.creditor.address;
        // Zip + city
        if ((data.creditor.zip + ' ' + data.creditor.city).length > 70) {
            throw new Error(
                'Creditor zip plus city must be a maximum of 70 characters.'
            );
        }
        qrString += '\n' + data.creditor.zip + ' ' + data.creditor.city;
        // Empty zip field
        qrString += '\n';
        // Empty city field
        qrString += '\n';
    }
    qrString += '\n' + data.creditor.country;

    // 7 x empty
    qrString += '\n'; // 1
    qrString += '\n'; // 2
    qrString += '\n'; // 3
    qrString += '\n'; // 4
    qrString += '\n'; // 5
    qrString += '\n'; // 6
    qrString += '\n'; // 7

    // Amount
    if (data.amount !== undefined) {
        qrString += '\n' + data.amount.toFixed(2);
    } else {
        qrString += '\n';
    }

    // Currency
    qrString += '\n' + data.currency;

    // Debtor
    if (data.debtor !== undefined) {
        if (data.debtor.houseNumber !== undefined) {
            // Address type
            qrString += '\nS';
            // Name
            qrString += '\n' + data.debtor.name;
            // Address
            qrString += '\n' + data.debtor.address;
            // House number
            qrString += '\n' + data.debtor.houseNumber;
            // Zip
            qrString += '\n' + data.debtor.zip;
            // City
            qrString += '\n' + data.debtor.city;
        } else {
            // Address type
            qrString += '\nK';
            // Name
            qrString += '\n' + data.debtor.name;
            // Address
            qrString += '\n' + data.debtor.address;
            // Zip + city
            if ((data.debtor.zip + ' ' + data.debtor.city).length > 70) {
                throw new Error(
                    'Debtor zip plus city must be a maximum of 70 characters.'
                );
            }
            qrString += '\n' + data.debtor.zip + ' ' + data.debtor.city;
            // Empty field zip
            qrString += '\n';
            // Empty field city
            qrString += '\n';
        }
        // Country
        qrString += '\n' + data.debtor.country;
    } else {
        // Empty field type
        qrString += '\n';
        // Empty field name
        qrString += '\n';
        // Empty field address
        qrString += '\n';
        // Empty field house number
        qrString += '\n';
        // Empty field zip
        qrString += '\n';
        // Empty field city
        qrString += '\n';
        // Empty field country
        qrString += '\n';
    }

    // Reference type
    qrString += '\n' + referenceType;

    // Reference
    if (data.reference !== undefined) {
        qrString += '\n' + data.reference;
    } else {
        qrString += '\n';
    }

    // Unstructured message
    if (data.message !== undefined) {
        qrString += '\n' + data.message;
    } else {
        qrString += '\n';
    }

    // End Payment Data
    qrString += '\n' + 'EPD';

    // Additional information
    if (data.additionalInformation !== undefined) {
        qrString += '\n' + data.additionalInformation;
    } else {
        qrString += '\n';
    }

    // AV1
    if (data.av1 !== undefined) {
        qrString += '\n' + data.av1;
    }
    if (data.av2 !== undefined) {
        qrString += '\n' + data.av2;
    }

    // return qrString;

    // Create QR Code

    const qrcodeString = QRCode.toString(
        qrString,
        {
            type: 'svg',
            width: utils.mmToPoints(46),
            margin: 0,
            errorCorrectionLevel: 'M',
        },
        () => { }
    ) as unknown as string;

    const svgPath = getSVGPathFromQRCodeString(qrcodeString);

    if (svgPath === undefined) {
        throw new Error('Could not convert svg image to path');
    }



    this.moveTo(utils.mmToPoints(67), this._marginTop + utils.mmToPoints(17));

    this.addPath(
        svgPath,
        utils.mmToPoints(67),
        this._marginTop + utils.mmToPoints(17)
    )
        .undash()
        .fillColor('black')
        .fill();

    // Black rectangle

    const background =
        'M18.3 0.7L1.6 0.7 0.7 0.7 0.7 1.6 0.7 18.3 0.7 19.1 1.6 19.1 18.3 19.1 19.1 19.1 19.1 18.3 19.1 1.6 19.1 0.7Z';
    const cross = 'M8.3 4H11.6V15H8.3V4Z M4.4 7.9H15.4V11.2H4.4V7.9Z';

    const backgroundPath: string = svgpath(background)
        .translate(utils.mmToPoints(19), utils.mmToPoints(19)).toString();

    const crossPath: string = svgpath(cross)
        .translate(utils.mmToPoints(19), utils.mmToPoints(19)).toString();


    this.addPath(
        background,
        utils.mmToPoints(86),
        this._marginTop + utils.mmToPoints(36)
    )
        .fillColor('black')
        .lineWidth(1.4357)
        .strokeColor('white')
        .fillAndStroke();

    this.addPath(
        cross,
        utils.mmToPoints(86),
        this._marginTop + utils.mmToPoints(36)
    )
        .fillColor('white')
        .fill();
}

function getSVGPathFromQRCodeString(qrcodeString: string): string | undefined {
    const svgObject = parse(qrcodeString);
    if (svgObject.children === undefined) {
        return;
    }
    firstChildLoop: for (const firstChild of svgObject.children) {
        if (firstChild.type !== 'element') {
            continue firstChildLoop;
        }
        secondChildLoop: for (const secondChild of firstChild.children) {
            if (typeof secondChild !== 'object') {
                continue secondChildLoop;
            }
            if (secondChild.type !== 'element') {
                continue secondChildLoop;
            }
            if (secondChild.properties === undefined) {
                continue secondChildLoop;
            }
            if (secondChild.properties.fill !== '#000000') {
                continue;
            }
            if (secondChild.properties.d === undefined) {
                continue secondChildLoop;
            }
            if (typeof secondChild.properties.d !== 'string') {
                continue secondChildLoop;
            }
            return secondChild.properties.d;
        }
    }
}

// https://github.com/schoero/SwissQRBill/blob/e52b42c910ca1081dc2cfb72ab06190536c7ff57/src/extended-pdf.ts#L222

function addPath(path: string, x: number, y: number): string {
    path = svgpath(path).translate(x, y).toString();
    return path;
}
