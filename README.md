# frederiksberg-elite-stats

# Guide til at opdatere tal

Efter at indtaste en ny kamp i SoloStats, kan forskellige aggregerede tal findes i WebReports på hjemmesiden.

1. Indtast ny kamp via app (i feltet 'venue' skrives kampnummer fra DVBF)
2. I WebReports, vælg den indtastede kamp, vælg "Ranking" og tryk på "Export Excel".
3. Den downloadede .csv-fil flyttes til /Users/alexandercappelen/Documents/GitHub/frederiksberg-elite-stats/data/web-reports og omdøbes efter navnestandarden "Frederiksberg-player_ranking_xxx_yyy_kampnr.csv", hvor xxx er hjemmeholdet og yyy er udeholdet, begge skrevet med tre tegn.
4. Herfra køres Python-programmet/programmerne, der indlæser og opsummerer tallene fra .csv-filerne, og gemmer disse som nye .json-filer, der indlæses af HTML og JavaScript.
5. For at fuldende processen skal de nye filer uploades til den pågældende Git-repo -- det gøres ved at benytte Git-funktionerne 'commit', hvor der skal tilføjes en kommentar, og 'push' (hvor der måske også skal tilføjes en kommentar). Herefter vil de nygenererede filer erstatte de foregående filer, der er til grund for den tilgængelige webpage.