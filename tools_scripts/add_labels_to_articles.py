# -*- coding: utf-8 -*-
from pymongo import MongoClient
import os

#mongoDB for migrating jano's data
client = MongoClient(os.environ['MONGODB_URI'])
mongodb = client.heroku_v7pt68m8
articles = mongodb.articles


ultimate_tag_translator ={
    "faqs": None,
    "novinky": "Novinky",
    "ostatne": "Ostatné",
    "vybavenie": "Vybavenie",
    "odkazy": None,
    "mapy": "Mapy",
    "dolezite_miesta": "Dôležité miesta",
    "stravovanie": "Stravovanie",
    "cestopisy": "Cestopisy",
    "spravy_z_terenu": "Správy z terénu",
    "zaujimavosti": "Zaujímavosti",
    "akcie": "Akcie",
    "neverejne": None,
    "obmedzenia": "Obmedzenia",
    "oznamy": "Oznamy",
    "cesta-hrdinov-snp": "Cesta hrdinov SNP",
    "akcie-snp": "Akcie Cesta hrdinov SNP",
    "akcie-ostatne": "Ostatné akcie",
    "oblecenie": "Oblečenie",
    "obuv": "Obuv",
    "o-cestesnpsk": "O CesteSNP.sk",
    "cela-trasa": "Celá trasa",
    "vku": "VKU",
    "shocart": "Shocart",
    "gps": "GPS",
    "batoh": "Batoh",
    "dukla-cergov-sarisska-vrchovina": "Dukla, Čergov, Šarišská vrchovina",
    "cierna-hora-volovske-vrchy": "Čierna hora, Volovské vrchy",
    "nizke-tatry": "Nízke Tatry",
    "velka-fatra-kremnicke-vrchy": "Veľká Fatra, Kremnické vrchy",
    "strazovske-vrchy-biele-karpaty": "Strážovske vrchy, Biele Karpatu",
    "male-karpaty": "Malé Karpaty",
    "recepty": "Recepty",
    "o-strave": "Stravovanie",
    "nezaradene": None,
    "spravy-z-terenu": "Správy z terénu",
    "live-sledovanie-clanky": "Články o LIVE Sledovaní",
    "rozhovory": "Rozhovory"

}

category_ids = {
    "58": "cesta-hrdinov-snp",
    "59": "ostatne",
    "88": "akcie-snp",
    "89": "akcie-ostatne",
    "44": "oblecenie",
    "45": "obuv",
    "57": "o-cestesnpsk",
    "56": "cela-trasa",
    "41": "vku",
    "42": "shocart",
    "43": "gps",
    "46": "batoh",
    "47": "ostatne",
    "48": "dukla-cergov-sarisska-vrchovina",
    "49": "cierna-hora-volovske-vrchy",
    "50": "nizke-tatry",
    "51": "velka-fatra-kremnicke-vrchy",
    "52": "strazovske-vrchy-biele-karpaty",
    "53": "male-karpaty",
    "54": "recepty",
    "55": "o-strave",
    "68": "o-snp",
    "61": "dukla-cergov-sarisska-vrchovina",
    "62": "cierna-hora-volovske-vrchy",
    "63": "nizke-tatry",
    "64": "velka-fatra-kremnicke-vrchy",
    "65": "strazovske-vrchy-biele-karpaty",
    "66": "male-karpaty",
    "67": "nezaradene",
    "79": "spravy-z-terenu",
    "80": "live-sledovanie-clanky",
    "81": "dukla-cergov-sarisska-vrchovina",
    "82": "cierna-hora-volovske-vrchy",
    "83": "nizke-tatry",
    "84": "velka-fatra-kremnicke-vrchy",
    "85": "strazovske-vrchy-biele-karpaty",
    "86": "male-karpaty",
    "94": "obmedzenia",
    "95": "rozhovory",
    "0": "oznamy"
}

section_ids = {
    "3": "faqs",
    "5": "novinky",
    "13": "ostatne",
    "8": "vybavenie",
    "14": "odkazy",
    "9": "mapy",
    "10": "dolezite_miesta",
    "11": "stravovanie",
    "12": "cestopisy",
    "15": "spravy_z_terenu",
    "16": "zaujimavosti",
    "17": "akcie",
    "18": "neverejne",
    "19": "obmedzenia",
    "0": "oznamy"
}

category_ids = {
    "58": "cesta-hrdinov-snp",
    "59": "ostatne",
    "88": "akcie-snp",
    "89": "akcie-ostatne",
    "44": "oblecenie",
    "45": "obuv",
    "57": "o-cestesnpsk",
    "56": "cela-trasa",
    "41": "vku",
    "42": "shocart",
    "43": "gps",
    "46": "batoh",
    "47": "ostatne",
    "48": "dukla-cergov-sarisska-vrchovina",
    "49": "cierna-hora-volovske-vrchy",
    "50": "nizke-tatry",
    "51": "velka-fatra-kremnicke-vrchy",
    "52": "strazovske-vrchy-biele-karpaty",
    "53": "male-karpaty",
    "54": "recepty",
    "55": "o-strave",
    "68": "o-snp",
    "61": "dukla-cergov-sarisska-vrchovina",
    "62": "cierna-hora-volovske-vrchy",
    "63": "nizke-tatry",
    "64": "velka-fatra-kremnicke-vrchy",
    "65": "strazovske-vrchy-biele-karpaty",
    "66": "male-karpaty",
    "67": "nezaradene",
    "79": "spravy-z-terenu",
    "80": "live-sledovanie-clanky",
    "81": "dukla-cergov-sarisska-vrchovina",
    "82": "cierna-hora-volovske-vrchy",
    "83": "nizke-tatry",
    "84": "velka-fatra-kremnicke-vrchy",
    "85": "strazovske-vrchy-biele-karpaty",
    "86": "male-karpaty",
    "94": "obmedzenia",
    "95": "rozhovory",
    "0": "oznamy"
}

all_articles = articles.find({})
i = 0




for article in all_articles:
    i += 1
    list_of_tags = []

    list_of_tags.append(section_ids[str(article["sectionid"])])
    list_of_tags.append(category_ids[str(article["catid"])])

    print list_of_tags

    #articles.update({"_id": article["_id"]}, {"$set": {"tags": list_of_tags}})

print "\n %s" % i