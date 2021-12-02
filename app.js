'use strict'

// Définition des templates XML
var qcmHeader = '<?xml version="1.0" encoding="UTF-8"?><quiz><question type="category"><category><text>{QCM_TITLE}</text></category></question>'
var questionHeaderTpl = '<question type="multichoice"><name><text>{TITLE}</text></name><questiontext format="html"><text>{QUESTION}</text></questiontext><externallink/><usecase>{USECASE}</usecase><defaultgrade>{GRADE}</defaultgrade><editeur>{EDI}</editeur><single>{IS_SINGLE}</single>'
var questionFooterTpl = '</question>'
var descritionTpl = '<question type="description"><name><text>{TITLE}</text></name><questiontext format="html"><text>{DESCRIPTION}</text></questiontext></question>'
var multichoiceAnswerTpl = '<answer fraction="{FRACT}" format="plain_text"><text>{REPONSE}</text><feedback><text>{FEEDBACK}</text></feedback></answer>'

// Initialisation de l'xml resultat construit section apres section
var outputXmlMsg = ''
var qcmTitle = ''

var question = {
    'id': '',
    'txt': '',
    'multi': 'true',
    'answers': {} // answers['A'] = {'txt': '','fract': 0} = answer
}

var answer = {
    'txt': '',
    'fract': 0
} 

///////////////////////////////////////////////////////////////////////
// FONCTIONS
//////////////////////////////////////////////////////////////////////

// // (*) Mettre en forme une ligne de texte (supprime les espaces en fin de ligne)
// const sanitizer = (txtLine) => txtLine.replace(/\s+/g, ' ')
// const sanitizer = (txtLine) => txtLine.trim()

// Contruire le bloc xml de la section courante et l'ajouter au xml résultat
function sectionBuilder(sectionName,curLine) {

    curLine = ((txtLine) => txtLine.trim())(curLine) // cf (*)
    // console.log('\''+curLine+'\'')

    if (sectionName == 'description') {
        
        question['txt'] = question['txt'] + '\n' + curLine 

    } else if (sectionName == 'multichoice') {

        if (!curLine.startsWith('answer:')) {
            
            // Line de question
            if (curLine.match(/^[0-9]+\. /)) {
                question['id'] = curLine.split('.')[0]
                question['txt'] = question['txt'] + '\n' + curLine.replace(/^[0-9]+\. /,'')
                
            }// Ligne de réponse
            else if (curLine.match(/^[A-Z]+\. /)) {
                question['answers'][curLine.split('.')[0]] = {'txt': curLine.replace(/^[A-Z]+\. /,''), 'fract': '0'}
            }
            else {
                question['txt'] = question['txt'] + '\n' + curLine
            }
        }
        else {

            var lineTab = curLine.substr(7).split(',')
            var fract = 100 / lineTab.length
            console.log(lineTab)
            console.log(question)
            
            if (lineTab.length > 1) {

                question['multi'] = 'false'
            }
            else {

                question['multi'] = 'true'
            }
            
            for (var i = 0; i < lineTab.length; i++) {
                console.log(lineTab[i])
                question['answers'][lineTab[i]]['fract'] = Math.round(fract).toString()
            }
        }                     
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
            .replace('{IS_SINGLE}', question['multi'])
        
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
        outputXmlMsg = qcmHeader.replace('{QCM_TITLE}', qcmTitle)
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
        }
        else if (inputTab[i].startsWith('#')) {
            qcmTitle = inputTab[i].substr(2)
        } // Traitement générique
        else {
            sectionBuilder(curSectionName,inputTab[i])
        }
    }

    closePrevSection(curSectionName)
    outputXmlMsg = outputXmlMsg + '</quiz>'
    xmlOutput.value = outputXmlMsg
});

