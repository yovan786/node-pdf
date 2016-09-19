var express = require('express');
var router = express.Router();
var fs = require('fs');
var dateFormat = require('dateFormat');
var PdfPrinter = require('pdfmake');
var avsFactory  = require('./avsFactory');

var fonts = {
	Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-Italic.ttf'
	}
};

var printer = new PdfPrinter(fonts);

var blue_velvet = '#16365C';
var white = '#fff';
var blue_gray = '#B8CCE4';
var gray = '#DCE6F1';
var black = '#000';

var occupation_period = 'Période d\' occupation';
var avs_certificate = 'Attestation de salaires AVS';
var avs_excluded_period = 'Attestation de salaires AVS, Hors période Revenus';
var recap = 'Récapitulation Attestation de salaires AVS';
var version  = 'Version_4.0_20141031';
var compensation_fund = 'Caisse de compensation AVS Lucerne';
var member_no = 'Numéro de membre';
var revenuePeriod = 'Période concernée Revenus';
var excludedPeriodRevenue = 'Hors période Revenus';
var general_total = 'Total général';
var year = '2013';

var lpp_insurer = 'Assureur LPP: ';
var laa_insurer = 'Assureur LAA: ';
var lpp_insurer_name = 'Pensionskasse Oldsoft';
var lpp_contract_no = '4500-0';
var laa_insurer_name = 'Backwork-Versicherungen';
var laa_client_no = '12577.2';

var address = {
	locality: 'Muster',
	canton: 'AG',
	street: 'Bahnhofstrasse 1',
	zipCode: '6002',
	nom_canton: 'Luzern'
};

var member_info = {
	fund: '003.000',
	member_no: '100-9976.9'
};

function setPageBreak() {
	return {text: '', pageBreak: 'before'};
}

function addOccupationPeriod(headers, position) {
	headers.splice(position, 0, {table: {body:[[{text: occupation_period, colSpan: 2}, {}], ['du', 'au']], widths:['*', '*']}, colSpan: 2, layout: 'noBorders', style: ['header', 'align_center'], margin:[0, 8, 0, -3]});
	headers.splice(position + 1, 0, {});
}

function formatAmount(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "'");
}

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

var formattedDate2 = function (date) {
	if (date && '' != date) {
		var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear().toString().substr(2,2);
		if (month.length < 2) month = '0' + month;
		if (day.length < 2) day = '0' + day;
		return [day, month, year].join('.');
	} else {
		return '';
	}
};

function calcSum (a, b) {
	return ((a * 1000) + (b * 1000)) / 1000;
}

router.get('/', function(req, res) {
	var pdfData = generate(avsFactory, req, res);
});

function setInsurerTable() {
	return [
	{
		table: {
			widths: ['25%', '70%'],
			body: [
			[{text: lpp_insurer}, {text: lpp_insurer_name + ', ' + lpp_contract_no, marginBottom: 10}],
			[{text: laa_insurer}, {text: laa_insurer_name + ', ' + laa_client_no}],
			]
		}, 
		layout: 'noBorders',
		style: ['common'],
		margin: [0, 15, 0, 15]
	}
	];
}


function setSubData(title, year, version, address, compensation_fund, member_info, header) {
	if(!header)
		header = 'header'
	return [{
		table: {
			widths: [ 200, 'auto'],
			body: [
			[{ text: title, style: [header]}, {text: year + '', style: [header]}], 
			[version, '']
			]
		}, 
		layout: 'noBorders',
		style: ['common']
	},
	{
		table: {
			widths: [ 100, 'auto', 'auto'],
			body: [
			[ address.locality + ' ' + address.canton, {text: compensation_fund, alignment: 'right'}, {text: member_info.fund, alignment: 'right'}],
			[ address.street, {text: member_no, alignment: 'right'}, {text: member_info.member_no, alignment: 'right'}],
			[address.zipCode + ' ' + address.nom_canton, '', '']
			]
		},
		layout: 'noBorders',
		style: ['common'],
		marginBottom: 10
	}];
}

function getSumData(data) {
	var sumHeaders = ['Récapitulation', 'Salaire AVS', 'Salaire AC', 'Salaire compl. AC', ''];

	sumHeaders =  sumHeaders.map(function  (item) {
		return {text: item, style: ['header', 'table_border']}
	});
	var formattedData = [sumHeaders];
	
	var fillColor = blue_gray;
	formattedData.push([
		{text: revenuePeriod, fillColor: fillColor},
		{text: formatAmount(data.avsInclusive.avs), fillColor: fillColor, style: ['align_right']},
		{text: formatAmount(data.avsInclusive.ac), fillColor: fillColor, style: ['align_right']},
		{text: formatAmount(data.avsInclusive.complementaryAc), fillColor: fillColor, style: ['align_right']},
		{text: '', fillColor: fillColor}
		]);

	fillColor = gray;

	formattedData.push([
		{text: excludedPeriodRevenue, fillColor: fillColor},
		{text: formatAmount(data.avsExclusive.avs), fillColor: fillColor, style: ['align_right']},
		{text: formatAmount(data.avsExclusive.ac), fillColor: fillColor, style: ['align_right']},
		{text: formatAmount(data.avsExclusive.complementaryAc), fillColor: fillColor, style: ['align_right']},
		{text: '', fillColor: fillColor}
		]);

	formattedData.push([
	{
		table: {
			widths: ['*', '*'],
			body: [
			[{text: general_total, style: ['header']}, {text: ''}]
			]
		},
		layout: 'noBorders'
	},
	{text: formatAmount(calcSum(data.avsInclusive.avs, data.avsExclusive.avs)), style: ['header']},
	{text: formatAmount(calcSum(data.avsInclusive.ac, data.avsExclusive.ac)), style: ['header']},
	{text: formatAmount(calcSum(data.avsInclusive.complementaryAc, data.avsExclusive.complementaryAc)), style: ['header']},
	''
	]);

	return formattedData;
}

function getMainData(avs) {
	var sumAvs = 0;
	var sumAc = 0;
	var sumComplementaryAC = 0;

	var headers = ['Numéro d\'assuré', 'Date de naissance', 'Nom et prénom', 'Salaire AVS', 'Salaire AC', 'Salaire compl. AC', 'M/F'];
	
	headers = headers.map(function  (item) {
		return {text: item, style: ['header', 'table_border', 'align_center']}
	});

	addOccupationPeriod(headers, 3);
	
	var certificateFooter = ['Total'];

	for (var i = 1; i < headers.length; i++) {
		certificateFooter.push('');
	}

	var pdfData = [headers];

	for (var i = 0; i < avs.length; i++) {
		var currentLine = [];
		var fillColor = gray;
		if(i % 2 == 0)
			fillColor = blue_gray;

		currentLine.push({text: avs[i].insurerNo, fillColor: fillColor, style: ['align_center']});
		currentLine.push({text: formattedDate(avs[i].dob), fillColor: fillColor, style: ['align_center']});
		currentLine.push({text: avs[i].fullName, fillColor: fillColor});
		currentLine.push({text: formattedDate2(avs[i].period.from), fillColor: fillColor, style: ['align_center']});
		currentLine.push({text: formattedDate2(avs[i].period.to), fillColor: fillColor, style: ['align_center']});
		currentLine.push({text: formatAmount(avs[i].avsSalary), fillColor: fillColor, style: ['align_right']});
		currentLine.push({text: formatAmount(avs[i].acSalary), fillColor: fillColor, style: ['align_right']});
		currentLine.push({text: formatAmount(avs[i].acComplementarySalary), fillColor: fillColor, style: ['align_right']});
		currentLine.push({text: avs[i].gender, fillColor: fillColor, style: ['align_center']});

		pdfData.push(currentLine); 
		
		if(avs[i].avsSalary !== '')
			sumAvs = calcSum(sumAvs, parseFloat(avs[i].avsSalary));

		if(avs[i].acSalary !== '')
			sumAc = calcSum(sumAc, parseFloat(avs[i].acSalary));

		if(avs[i].acComplementarySalary !== '')
			sumComplementaryAC = calcSum(sumComplementaryAC, parseFloat(avs[i].acComplementarySalary));
	}

	certificateFooter[0] = {text: certificateFooter[0], style: ['header']};
	certificateFooter[5] = {text: formatAmount((sumAvs).toFixed(2)) + '', style: ['header', 'align_right']};
	certificateFooter[6] = {text: formatAmount((sumAc).toFixed(2)) + '', style: ['header', 'align_right']};
	certificateFooter[7] = {text: formatAmount((sumComplementaryAC).toFixed(2)) + '', style: ['header', 'align_right']};
	
	pdfData.push(certificateFooter);

	return {
		data: pdfData,
		sum: {
			avs: sumAvs,
			ac: sumAc,
			complementaryAc: sumComplementaryAC
		}
	};
}

function setHeader() {
	return function(currentPage, pageCount) {
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
					['Page', { text: currentPage.toString() + ' / ' + pageCount}]
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
	}
}

function setInfo(data) {
	return [ { table: {
		headerRows: 1,
		widths: [ '16.2%', '13%', '14%', '9%', '9%', '9%', '9%', '14%', '10%' ],
		body: data,
	},style:['common'],  
	layout: {
		hLineWidth: function (i, node) {
			return 2;
		},
		vLineWidth: function (i, node) {
			return 2;
		},
		hLineColor: function (i, node) {
			return white;
		},
		vLineColor: function (i, node) {
			return white;
		},
		paddingLeft: function (i, node) { return 2; },
		paddingRight: function (i, node) { return 2; },
		paddingTop: function (i, node) { return 2; },
		paddingBottom: function (i, node) { return 2; }
	}
}];
}

function setSignatureFooter() {
	return [{text: 'Date', style: ['common'], margin: [0, 15, 15, 15]}, {text: 'Signature', style: ['common']}];
}


function setRecap(data) {
	return [ { table: {
		headerRows: 1,
		widths: [ '56%', '10%', '10%', '14%', '10%' ],
		body: getSumData(data)
	},style:['common'],  
	layout: {
		hLineWidth: function (i, node) {
			return 2;
		},
		vLineWidth: function (i, node) {
			return 2;
		},
		hLineColor: function (i, node) {
			return white;
		},
		vLineColor: function (i, node) {
			return white;
		},
		paddingLeft: function (i, node) { return 2; },
		paddingRight: function (i, node) { return 2; },
		paddingTop: function (i, node) { return 2; },
		paddingBottom: function (i, node) { return 2; }
	}
}];
}


function generate(avsFactory, req, res) {
	var  avs = avsFactory.avs;
	var  excludedPeriods = avsFactory.excludedPeriods;
	var avsData = getMainData(avs);
	var excludedPeriodsData = getMainData(excludedPeriods);

	var sumData = {
		avsInclusive: {
			avs: avsData.sum.avs,
			ac: avsData.sum.ac,
			complementaryAc: avsData.sum.complementaryAc
		},
		avsExclusive: {
			avs: excludedPeriodsData.sum.avs,
			ac: excludedPeriodsData.sum.ac,
			complementaryAc: excludedPeriodsData.sum.complementaryAc
		}
	};

	var docDefinition = {
		header: setHeader(),
		content: [
		setSubData(avs_certificate, year, version, address, compensation_fund, member_info),
		setInfo(avsData.data),
		setSignatureFooter(),
		setPageBreak(),
		setSubData(avs_excluded_period, year, version, address, compensation_fund, member_info),
		setInfo(excludedPeriodsData.data),
		setSignatureFooter(),
		setPageBreak(),
		setSubData(recap, year, version, address, compensation_fund, member_info, 'black_header'),
		setRecap(sumData),
		setInsurerTable(),
		setSignatureFooter()
		],
		pageMargins: 40,
		styles: {
			common: {
				fontSize: 6.5
			},
			header: {
				color: white,
				fillColor: blue_velvet
			},
			table_border : {
				margin: [0, 10, 0, 10]
			},
			align_center: {
				alignment: 'center'
			},
			align_right: {
				alignment: 'right'
			},
			black_header: {
				color: white,
				fillColor: black
			}
		}
	};

	var pdfDoc = printer.createPdfKitDocument(docDefinition)
	var fileName = dateFormat(new Date(), 'yyyy-mm-dd_h_MM_ss_TT');
	pdfDoc.pipe(res);
	pdfDoc.end();
	res.writeHead(200, {
		'Content-Type': 'application/pdf',
		'Content-Disposition': 'inline; filename=' + fileName + '.pdf'
	});
	return;
}

module.exports = router;
