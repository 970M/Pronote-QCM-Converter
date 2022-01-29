# Pronote_QCM_Converter

## Convertiseur de QCM au format XML moodle pour import dans PRONOTE

#### Génère le QCM au format xml à partir du format texte suivant :

    description   
    Une description qui peut inclure des   
    saut à la ligne   

    multichoice   
    1. La 1ere question à pour réponses :   
    Plusieurs réponses possibles
    A. Celle-ci   
    B. Mais pas celle-ci   
    C. Celle-la   
    D. Ou encore celle-la   
    E. Ni celle-la   
    answer:A,C,D   


## Version

__V1.1.0 :__
Amélioration du taitement. 
Moins sensible au fin de ligne.
Factorisation du code. 
Gestion des sauts de ligne dans les questions.
Prise en compte du titre du QCM.
Gestion du nombre de réponse possible.


##### TBD : 

__1.__ Implémenter les types truefalse :   
   
    truefalse   
    2. Si un utilisateur le demande, PrivateRun doit lui fournir toutes les données qu'il possède sur lui, dans un format compréhensible.   
    answer: True   
   
__2.__ La section description n'est pas affichée dans pronote (pronote le veut-il?) 

