var express = require('express');
var router = express.Router();
var fs = require("fs");
var dateFormat = require('dateFormat');
var PdfPrinter = require('pdfmake');
var blobStream  = require('blob-stream');

var headers = ["Numéro d'assuré", "Date de naissance", "Nom et prénom", "du", "au", "Salaire AVS", "Salaire AC", "Salaire compl. AC", "M/F"];

var header_blue_velvet = "#16365C";
var header_white = "#fff"
var zebra_blue_gray = "#B8CCE4";
var zebra_gray = "#DCE6F1";

var avs_certificate = 'Attestation de salaires AVS';
var version  = 'Version_4.0_20141031';

var sumAvs = 0;
var sumAc = 0;
var sumComplementaryAC = 0;

var address = {
	locality: 'Muster',
	canton: 'AG',
	street: 'Bahnhofstrasse 1',
	zipCode: '6002',
	nom_canton: 'Luzern'
};

var compensation_fund = "Caisse de compensation AVS Lucerne";
var member_no = "Numéro de membre";

var member_info = {
	fund: "003.000",
	member_no: "100-9976.9"
};

var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-Italic.ttf'
	}
};

var printer = new PdfPrinter(fonts);
var tempFileBase64 = ''

router.get('/', function(req, res) {
	var data = [{
		"insurerNo": "Inconnu",
		"dob": "1967-06-30 00:00:00",
		"fullName": "Herz Monica",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2031-03-13 00:00:00"
		},
		"avsSalary": "36800.00",
		"acSalary": "31500.00",
		"acComplementarySalary": "5300.00",
		"gender": "F"
	}, {
		"insurerNo": "756.3047.5009.62",
		"dob": "1948-12-31 00:00:00",
		"fullName": "Aebi Anna",
		"period": {
			"from": "2001-02-13 00:00:00",
			"to": "2027-03-13 00:00:00"
		},
		"avsSalary": "25242.05",
		"acSalary": "",
		"acComplementarySalary": "",
		"gender": "F"
	}, {
		"insurerNo": "756.3426.3448.04",
		"dob": "1969-04-11 00:00:00",
		"fullName": "Bosshard Peter",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "342000.00",
		"acSalary": "126000.00",
		"acComplementarySalary": "189000.00",
		"gender": "M"
	}, {
		"insurerNo": "756.3431.9824.73",
		"dob": "1995-01-01 00:00:00",
		"fullName": "Casanova Renato",
		"period": {
			"from": "2027-02-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "139500.00",
		"acSalary": "106400.00",
		"acComplementarySalary": "33100.00",
		"gender": "M"
	}, {
		"insurerNo": "756.3434.5392.78",
		"dob": "1977-02-28 00:00:00",
		"fullName": "Degelo Lorenz",
		"period": {
			"from": "2028-02-13 00:00:00",
			"to": "2001-03-13 00:00:00"
		},
		"avsSalary": "2800.00",
		"acSalary": "700.0",
		"acComplementarySalary": "1050.00",
		"gender": "M"
	}, {
		"insurerNo": "756.6328.7099.17",
		"dob": "1976-12-11 00:00:00",
		"fullName": "Duss Regula",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2031-10-13 00:00:00"
		},
		"avsSalary": "142000.00",
		"acSalary": "105000.00",
		"acComplementarySalary": "37000.00",
		"gender": "F"
	}, {
		"insurerNo": "756.1931.9954.43",
		"dob": "1947-01-01 00:00:00",
		"fullName": "Estermann Michael",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "138200.00",
		"acSalary": "",
		"acComplementarySalary": "",
		"gender": "M"
	}, {
		"insurerNo": "756.3438.2653.71",
		"dob": "1987-06-17 00:00:00",
		"fullName": "Farine Corinne",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2028-02-13 00:00:00"
		},
		"avsSalary": "25300.00",
		"acSalary": "21000.00",
		"acComplementarySalary": "4300.00",
		"gender": "F"
	}, {
		"insurerNo": "756.3438.2653.71",
		"dob": "1987-06-17 00:00:00",
		"fullName": "Farine Corinne",
		"period": {
			"from": "2031-10-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "36000.00",
		"acSalary": "21350.00",
		"acComplementarySalary": "14650.00",
		"gender": "F"
	}, {
		"insurerNo": "756.3454.9922.51",
		"dob": "1956-06-18 00:00:00",
		"fullName": "Ganz Edith",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2027-02-13 00:00:00"
		},
		"avsSalary": "21000.00",
		"acSalary": "19950.00",
		"acComplementarySalary": "1050.00",
		"gender": "F"
	}, {
		"insurerNo": "756.6362.5066.57",
		"dob": "1987-02-28 00:00:00",
		"fullName": "Ganz Heinz",
		"period": {
			"from": "2001-02-13 00:00:00",
			"to": "2031-10-13 00:00:00"
		},
		"avsSalary": "50700.00",
		"acSalary": "50700.00",
		"acComplementarySalary": "",
		"gender": "M"
	}, {
		"insurerNo": "756.1934.1678.78",
		"dob": "1980-10-15 00:00:00",
		"fullName": "Inglese Rosa",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2031-03-13 00:00:00"
		},
		"avsSalary": "9750.00",
		"acSalary": "9750.00",
		"acComplementarySalary": "",
		"gender": "F"
	}, {
		"insurerNo": "756.1934.1678.78",
		"dob": "1980-10-15 00:00:00",
		"fullName": "Inglese Rosa",
		"period": {
			"from": "2001-10-13 00:00:00",
			"to": "2031-10-13 00:00:00"
		},
		"avsSalary": "5450.00",
		"acSalary": "5450.00",
		"acComplementarySalary": "",
		"gender": "F"
	}, {
		"insurerNo": "756.1934.1678.78",
		"dob": "1980-10-15 00:00:00",
		"fullName": "Inglese Rosa",
		"period": {
			"from": "2001-12-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "11600.00",
		"acSalary": "10500.00",
		"acComplementarySalary": "1100.00",
		"gender": "F"
	}, {
		"insurerNo": "756.3514.6025.02",
		"dob": "1989-03-23 00:00:00",
		"fullName": "Jung Claude",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2031-10-13 00:00:00"
		},
		"avsSalary": "97500.00",
		"acSalary": "97500.00",
		"acComplementarySalary": "",
		"gender": "M"
	}, {
		"insurerNo": "756.6412.9848.00",
		"dob": "1961-08-15 00:00:00",
		"fullName": "Kaiser Beat",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "21000.00",
		"acSalary": "21000.00",
		"acComplementarySalary": "",
		"gender": "M"
	}, {
		"insurerNo": "756.6417.0995.23",
		"dob": "1949-02-05 00:00:00",
		"fullName": "Lusser Pia",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2028-02-13 00:00:00"
		},
		"avsSalary": "4000.00",
		"acSalary": "4000.00",
		"acComplementarySalary": "",
		"gender": "F"
	}, {
		"insurerNo": "756.3560.4682.44",
		"dob": "1948-09-28 00:00:00",
		"fullName": "Martin René",
		"period": {
			"from": "2001-03-13 00:00:00",
			"to": "2030-09-13 00:00:00"
		},
		"avsSalary": "5000.00",
		"acSalary": "5000.00",
		"acComplementarySalary": "",
		"gender": "M"
	}, {
		"insurerNo": "756.3560.4682.44",
		"dob": "1948-09-28 00:00:00",
		"fullName": "Martin René",
		"period": {
			"from": "2001-10-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "-9000.00",
		"acSalary": "",
		"acComplementarySalary": "",
		"gender": "M"
	}, {
		"insurerNo": "756.6444.1627.57",
		"dob": "1980-10-04 00:00:00",
		"fullName": "Nestler Paula",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "340200.00",
		"acSalary": "126000.00",
		"acComplementarySalary": "189000.00",
		"gender": "F"
	}, {
		"insurerNo": "756.6458.7191.14",
		"dob": "1949-02-04 00:00:00",
		"fullName": "Nunez Maria",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2028-02-13 00:00:00"
		},
		"avsSalary": "23500.00",
		"acSalary": "21000.00",
		"acComplementarySalary": "2500.00",
		"gender": "F"
	}, {
		"insurerNo": "756.6458.7191.14",
		"dob": "1949-02-04 00:00:00",
		"fullName": "Nunez Maria",
		"period": {
			"from": "2001-03-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "500.0",
		"acSalary": "",
		"acComplementarySalary": "",
		"gender": "F"
	}, {
		"insurerNo": "756.1940.8577.01",
		"dob": "1995-12-30 00:00:00",
		"fullName": "Ott Hans",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "25600.00",
		"acSalary": "25600.00",
		"acComplementarySalary": "",
		"gender": "M"
	}, {
		"insurerNo": "756.3598.1127.37",
		"dob": "1949-09-30 00:00:00",
		"fullName": "Paganini Maria",
		"period": {
			"from": "2001-01-13 00:00:00",
			"to": "2030-09-13 00:00:00"
		},
		"avsSalary": "10200.00",
		"acSalary": "10200.00",
		"acComplementarySalary": "",
		"gender": "F"
	}, {
		"insurerNo": "756.3598.1127.37",
		"dob": "1949-09-30 00:00:00",
		"fullName": "Paganini Maria",
		"period": {
			"from": "2001-10-13 00:00:00",
			"to": "2031-12-13 00:00:00"
		},
		"avsSalary": "6000.00",
		"acSalary": "",
		"acComplementarySalary": "",
		"gender": "F"
	}, {
		"insurerNo": "756.6532.7168.79",
		"dob": "1947-11-11 00:00:00",
		"fullName": "Schüpbach Ernst",
		"period": {
			"from": "2020-02-13 00:00:00",
			"to": "2015-03-13 00:00:00"
		},
		"avsSalary": "2200.00",
		"acSalary": "",
		"acComplementarySalary": "",
		"gender": "M"
	}];
	var pdfData = generate(data, req, res);
});

function generate(data, req, res) {
	headers = headers.map(function  (item) {
		return {text: item, style: ['header', 'table_border']}
	});

	var certificateFooter = ['Total'];

	for (var i = 1; i < headers.length; i++) {
		certificateFooter.push('');
	}

	var pdfData = [headers];

	for (var i = 1; i < data.length; i++) {
		var currentLine = [];
		var fillColor = zebra_blue_gray;
		if(i % 2 == 0)
			fillColor = zebra_gray;
		currentLine.push({text: data[i].insurerNo, fillColor: fillColor});
		currentLine.push({text: data[i].dob, fillColor: fillColor});
		currentLine.push({text: data[i].fullName, fillColor: fillColor});
		currentLine.push({text: data[i].period.from, fillColor: fillColor});
		currentLine.push({text: data[i].period.to, fillColor: fillColor});
		currentLine.push({text: data[i].avsSalary, fillColor: fillColor});
		currentLine.push({text: data[i].acSalary, fillColor: fillColor});
		currentLine.push({text: data[i].acComplementarySalary, fillColor: fillColor});
		currentLine.push({text: data[i].gender, fillColor: fillColor});

		pdfData.push(currentLine); 

		sumAvs += data[i].avsSalary !== '' ? parseFloat(data[i].avsSalary) : 0;
		sumAc += data[i].acSalary !== '' ? parseFloat(data[i].acSalary) : 0;
		sumComplementaryAC += data[i].acComplementarySalary !== '' ? parseFloat(data[i].acComplementarySalary) : 0;
	}

	certificateFooter[0] = {text: certificateFooter[0], style: ['header']};
	certificateFooter[5] = {text: sumAvs + '', style: ['header']};
	certificateFooter[6] = {text: sumAc + '', style: ['header']};
	certificateFooter[7] = {text: sumComplementaryAC + '', style: ['header']};

	pdfData.push(certificateFooter);

	var formattedDate = function (date) {
		if (date && '' != date) {
			var d = new Date(date),
			month = '' + (d.getMonth() + 1),
			day = '' + d.getDate(),
			year = d.getFullYear();
			if (month.length < 2) month = '0' + month;
			if (day.length < 2) day = '0' + day;
			return [day, month, year].join('.');
		} else {
			return '';
		}
	};

	var docDefinition = {
		header: function(currentPage, pageCount) {
			return [
			{
				columns: [
				{
					width: '*',
					text: ''
				},
				{ 
					table: {
						widths: ['*', '*'],
						body: [
						['Date', { text:formattedDate(new Date()) + ''}], 
						['Page', { text: currentPage.toString() + '/' + pageCount}]
						]
					}, 
					layout: 'noBorders',
					style: ['common'],
					alignment: 'right',
					width: 100
				}

				],
				columnGap: 3,
				style: ['common'],
				margin: [0, 15, 50, 50]
			}

			];
		},
		content: [
		{
			table: {
				widths: [ 200, 'auto'],
				body: [
				[{ text: avs_certificate, style: ['header']}, {text: new Date().getFullYear() + '', style: ['header']}], 
				[ version , '']
				]
			}, 
			layout: 'noBorders',
			style: ['common']
		},
		{
			table: {
				widths: [ 100, 'auto', 'auto'],
				body: [
				[ address.locality + ' ' + address.canton, {text: compensation_fund, alignment: "right"}, {text: member_info.fund, alignment: "right"}],
				[ address.street, {text: member_no, alignment: "right"}, {text: member_info.member_no, alignment: "right"}],
				[address.zipCode + ' ' + address.nom_canton, '', '']
				]
			},
			layout: 'noBorders',
			style: ['common'],
			marginBottom: 10
		},
		{
			table: {
				headerRows: 1,
				widths: [ '16.2%', '13%', '14%', '9%', '9%', '9%', '9%', '14%', '10%' ],
				body: pdfData,
			},
			style:['common'],  
			layout: {
				hLineWidth: function(i, node) {
					return 2;
				},
				vLineWidth: function(i, node) {
					return 2;
				},
				hLineColor: function(i, node) {
					return header_white;
				},
				vLineColor: function(i, node) {
					return header_white;
				},
				paddingLeft: function(i, node) { return 2; },
				paddingRight: function(i, node) { return 2; },
				paddingTop: function(i, node) { return 2; },
				paddingBottom: function(i, node) { return 2; }
			}
		}, 
		{text: 'Date', style: ['common'], margin: [0, 15, 15, 15]},
		{text: 'Signature', style: ['common']}
		],
		pageMargins: 40,
		styles: {
			common: {
				fontSize: 6.5
			},
			header: {
				bold: true,
				color: 'white',
				fillColor: header_blue_velvet
			},
			table_border : {
				margin: [0, 10, 0, 10]
			}
		}
	};

	var pdfDoc = printer.createPdfKitDocument(docDefinition)
	var fileName = dateFormat(new Date(), 'yyyy-mm-dd_h_MM_ss_TT');
	pdfDoc.pipe(res);
	pdfDoc.end();
	res.writeHead(200, {
		'Content-Type': 'application/pdf',
		'Content-Disposition': 'inline; filename=' + fileName + ".pdf"
	});
	return;
}

module.exports = router;
