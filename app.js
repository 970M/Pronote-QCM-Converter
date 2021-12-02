'use strict'

/*
description
Dans ce premier QCM, nous allons nous placer dans le contexte de la réalisation d'un logiciel de running, exploitant des données issues d'un dispositif de type "montre connectée", par la société "PrivateRun". L'architecture considérée est la suivante :

1- La montre connectée (e.g. Android) appartenant à l'utilisateur, client de la société PrivateRun. L'utilisateur a installé un logiciel propriétaire de PrivateRun qui permet de récupérer des informations sur la géolocalisation de la personne la portant (position et vitesse) et de les stocker en local sur la montre (ou le portable connecté à la montre), mais également de pouvoir les uploader sur un serveur de PrivateRun.

2- Des serveurs (ou cloud) loués par PrivateRun à la société SuperCloudProvider sur lesquels la société PrivateRun a installé un logiciel permettant d'effectuer des traitements sur les données uploadées par les utilisateurs sur ce cloud, et de les présenter sur un site web hébergé sur le même cloud. Le site web contient une partie privée, contenant les données de toutes les trajectoires d'un utilisateur, accessible via un login et mot de passe, et une partie publique avec des données qui sont disponibles à tout le monde, sans login.

PrivateRun s'autorise à mettre à jour le logiciel sur la montre connectée à distance, après accord de l'utilisateur.

multichoice
1. Voici la liste des données qui sont récupérées par l'entreprise PrivateRun. Indiquez quelles sont les données qui sont des données personnelles. Attention, plusieurs réponses sont possibles.
A. Les données de géolocalisation issues de la montre connectée.
B. Le numéro de version du logiciel installé sur la montre.
C. Le nom et le prénom de l'utilisateur.S
D. La date de naissance de l'utilisateur.
E. Le type de navigateur (Firefox, Chrome, Internet Explorer...) utilisé pour se connecter au site web de PrivateRun.
answer:A,C,D

truefalse
2. Si un utilisateur le demande, PrivateRun doit lui fournir toutes les données qu'il possède sur lui, dans un format compréhensible.
Answer: True
*/

// Définition des templates XML
var qcmHeader = '<?xml version="1.0" encoding="UTF-8"?><quiz><question type="category"><category><text>QCM</text></category></question>'
var questionHeaderTpl = '<question type="multichoice"><name><text>{TITLE}</text></name><questiontext format="html"><text>{QUESTION}</text></questiontext><externallink/><usecase>{USECASE}</usecase><defaultgrade>{GRADE}</defaultgrade><editeur>{EDI}</editeur><single>{IS_SINGLE}</single>'
var questionFooterTpl = '</question>'
var descritionTpl = '<question type="description"><name><text>{TITLE}</text></name><questiontext format="html"><text>{DESCRIPTION}</text></questiontext></question>'
var multichoiceAnswerTpl = '<answer fraction="{FRACT}" format="plain_text"><text>{REPONSE}</text><feedback><text>{FEEDBACK}</text></feedback></answer>'


// Initialisation de l'xml resultat construit section apres section
var outputXmlMsg = ''
var curTxt = ''

var question = {
    'id': '',
    'txt': '',
    'answers': {} // answers['A'] = {'txt': '','fract': 0} = answer
}

var answer = {
    'txt': '',
    'fract': 0
} 

///////////////////////////////////////////////////////////////////////
// FONCTIONS
//////////////////////////////////////////////////////////////////////

// Contruire le bloc xml de la section courante et l'ajouter au xml résultat
function sectionBuilder(sectionName,curLine) {

    if (sectionName == 'description') {
        
        question['txt'] = question['txt'] + '\n' + curLine 

    } else if (sectionName == 'multichoice') {

        if (!curLine.startsWith('answer:')) {
            
            var lineTab = curLine.split('.')

            // Line de question
            if (lineTab[0].match(/[0-9]+/)) {

                question['id'] = lineTab[0]
                question['txt'] = lineTab[1]
            }
            // Ligne de réponse
            if (lineTab[0].match(/[A-Z]/)) {
                
                question['answers'][lineTab[0]] = {'txt': lineTab[1], 'fract': '0'}
            }
        }
        else {

            var lineTab = curLine.substr(7).split(',')
            var fract = 100 / lineTab.length
            console.log(lineTab)
            console.log(question)
            
            for (var i = 0; i < lineTab.length; i++) {
                console.log(lineTab[i])
                question['answers'][lineTab[i]]['fract'] = Math.round(fract).toString()
            }
        }                     
    } else if (sectionName == 'truefalse') {
        
    } else {
        //outputXmlMsg = '<?xml version="1.0" ?> <quiz>'
    }
}

// Finaliser le bloc xml de la section précédente et l'ajouter au xml résultat
function closePrevSection(sectionName) {

    if (sectionName == 'description') {

        outputXmlMsg = outputXmlMsg + descritionTpl
            .replace('{TITLE}', 'Description')
            .replace('{DESCRIPTION}', question['txt'] )
             
    } else if (sectionName == 'multichoice') {
        
        outputXmlMsg = outputXmlMsg + questionHeaderTpl
            .replace('{TITLE}', 'Question n°' + question['id'])
            .replace('{QUESTION}', question['txt'] )
            .replace('{USECASE}', '1')
            .replace('{GRADE}', '2')
            .replace('{EDI}', '0')
            .replace('{IS_SINGLE}', 'false')
        
        for (var ans in question['answers'] ) { 

            console.log(ans)
            outputXmlMsg = outputXmlMsg + multichoiceAnswerTpl
                .replace('{FRACT}',question['answers'][ans]['fract'])
                .replace('{REPONSE}', question['answers'][ans]['txt'])
                .replace('{FEEDBACK}', '')
        }
        outputXmlMsg = outputXmlMsg + questionFooterTpl

    } else {
        // Initialiser lors de la premiere section (sectionName = '')
        outputXmlMsg = qcmHeader
    }

    // RAZ (faire mieux avec variable locale en parametre)
    question = {'id': '', 'txt': '', 'answers': {}}
    
}

///////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////
document.getElementById('b-convert').addEventListener("click", function mdConvert2Xml() {

    var mdInput = document.getElementById('md-input')
    var xmlOutput = document.getElementById('xml-output')

    // String parser
    var inputMsg = mdInput.value
    inputMsg = inputMsg.replace(/[\n]/gi, "§")

    // Construire une liste avec chacunes des lignes de texte
    var inputTab = inputMsg.split('§')

    // Indicateur de construction de blocs
    var curSectionName = ''
    // Parcourir la liste et construire le texte au format xml (cette partie doit pouvoir être synthétisé/factorisé, TBD)
    for (var i = 0; i < inputTab.length; i++) {

        // Initialiser suite à detection de section description
        if (inputTab[i].startsWith('description')) {
            // Finaliser le précédent bloc xml et l'ajouter au xml résultat
            closePrevSection(curSectionName)
            curSectionName = 'description'
        } // Initialiser suite à detection de section multichoice
        else if (inputTab[i].startsWith('multichoice')) {
            // Finaliser le précédent bloc xml et l'ajouter au xml résultat
            closePrevSection(curSectionName)
            curSectionName = 'multichoice'
        } // Initialiser suite à detection de section truefalse
        else if (inputTab[i].startsWith('truefalse')) {
            
            // Finaliser le précédent bloc xml et l'ajouter au xml résultat
            closePrevSection(curSectionName)
            curSectionName = 'truefalse'
        } // Traitement générique
        else {
            sectionBuilder(curSectionName,inputTab[i])
        }
    }

    closePrevSection(curSectionName)
    outputXmlMsg = outputXmlMsg + '</quiz>'
    xmlOutput.value = outputXmlMsg

});

