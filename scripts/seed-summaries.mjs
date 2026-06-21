import { readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const path = __dirname + '/../data/2026.json';
const data = JSON.parse(readFileSync(path, 'utf-8'));

const summaries = {
  '137093': 'Sabor je primio na znanje izvješće o tome da zastupnik Ivan Matić nastavlja aktivno obnašati svoju dužnost, a njegov zamjenik Ivica Ledenko prestaje ga zamjenjivati.',
  '137092': 'Sabor je primio na znanje da zastupnik dr. sc. Furio Radin privremeno stavlja u mirovanje svoj mandat, a umjesto njega zastupničku dužnost preuzima zamjenik Marin Corva.',
  '137091': 'Odbor Sabora predlaže razrješenje jednog člana i izbor novog člana Odbora za obranu Hrvatskoga sabora.',
  '137090': 'Predlaže se razrješenje jednog člana i izbor nove članice Odbora za Hrvate izvan Republike Hrvatske.',
  '137089': 'Sabor imenuje novog guvernera Hrvatske narodne banke, središnje banke zadužene za monetarnu politiku i nadzor bankarskog sustava.',
  '137085': 'Vlada podnosi Saboru završni obračun državnog proračuna za 2025. godinu, koji prikazuje koliko je novca prikupljeno i potrošeno u ime svih građana.',
  '137084': 'Vlada izvještava Sabor o tome koliko je birača upisano u biračke spiskove i kako su raspoređeni po izbornim jedinicama na kraju prvog tromjesečja 2026. godine.',
  '137081': 'Vlada predlaže izmjene temeljnog zakona koji uređuje ugovore i obveze između građana i tvrtki — od kupoprodaje i najma do zajmova i odgovornosti za štetu.',
  '137080': 'Vlada predlaže novi zakon kojim se uređuju slobodne zone — posebna područja u kojima tvrtke mogu poslovati uz povoljnije carinske i porezne uvjete kako bi se privukle investicije.',
  '137079': 'Vlada predlaže zakon koji uređuje posao agencija za nekretnine — tko smije posredovati pri kupnji ili najmu nekretnina i pod kojim uvjetima, radi zaštite kupaca i prodavatelja.',
  '137078': 'Vlada predlaže zakon koji štiti aktiviste, novinare i druge osobe uključene u javni život od zlouporabe sudskih postupaka kojima ih se nastoji ušutkati (tzv. SLAPP tužbe).',
  '137077': 'Vlada usklađuje hrvatsko zakonodavstvo s europskom uredbom koja obvezuje države na obnovu oštećenih prirodnih staništa — šuma, močvara, livada i morskih ekosustava.',
  '137076': 'Vlada hitno mijenja zakon koji regulira kako se u Hrvatskoj prikupljaju i objavljuju službeni statistički podaci, primjerice o gospodarstvu, stanovništvu ili zaposlenosti.',
  '137075': 'Vlada hitno uvodi novi zakon koji uređuje kako se odobravaju, prodaju i koriste lijekovi i medicinski proizvodi namijenjeni životinjama, u skladu s europskim pravilima.',
  '137074': 'Vlada predlaže razrješenje predsjednika Upravnog vijeća HANFA-e, regulatora koji nadzire tržište kapitala, osiguranja i mirovinskih fondova u Hrvatskoj.',
  '137073': 'Nacionalno vijeće za sport podnosi Saboru godišnje izvješće o svom radu i aktivnostima u području razvoja sporta u Hrvatskoj tijekom 2025. godine.',
  '137072': 'Vlada izvještava Sabor o tome što je učinjeno u 2025. godini kako bi se podržala hrvatska dijaspora — Hrvati koji žive izvan domovine.',
  '137071': 'Vlada predlaže izmjene zakona koji uređuje azil i privremenu zaštitu stranaca u Hrvatskoj — tko ima pravo na zaštitu, kako se postupak provodi i koja su prava i obveze zaštićenih osoba.',
  '137070': 'Vlada hitno donosi zakon za usklađivanje s europskim pravilima o financijskim izvedenicama koje se trguju izvan burze, s ciljem smanjenja rizika u financijskom sustavu.',
  '137069': 'Vlada mijenja zakon koji propisuje koliko smiju raditi vozači kamiona i autobusa te kako se mora bilježiti njihovo radno vrijeme tahografom, radi veće sigurnosti u cestovnom prometu.',
  '137068': 'Vlada predlaže izmjene zakona koji uređuje burzu i trgovanje dionicama, obveznicama i drugim vrijednosnim papirima u Hrvatskoj, uglavnom radi usklađivanja s europskim propisima.',
  '137067': 'Sabor potvrđuje izmjene međunarodnog sporazuma o energetskoj suradnji koji uređuje uvjete ulaganja i poslovanja u energetskom sektoru između zemalja potpisnica.',
  '137066': 'Sabor bira novu zamjenicu pravobraniteljice za djecu — dužnosnice koja štiti prava i interese djece u Hrvatskoj.',
  '137065': 'Vlada hitno mijenja zakon o računovodstvu koji propisuje kako tvrtke moraju voditi poslovne knjige i sastavljati financijska izvješća, uglavnom radi usklađivanja s europskim standardima.',
  '137064': 'Vlada predlaže novi zakon koji uređuje prava potrošača pri uzimanju kredita — što banke moraju jasno objaviti prije potpisivanja ugovora i kakva zaštita postoji ako dođe do problema s otplatom.',
  '137063': 'Vlada hitno mijenja Zakon o trgovini koji uređuje uvjete rada trgovina, radno vrijeme, prava potrošača i obveze prodavača u maloprodaji i veleprodaji.',
  '137062': 'Vlada predlaže izmjene Zakona o obrtu koji uređuje uvjete za pokretanje i obavljanje obrtničke djelatnosti — od frizera i tesara do automehaničara i pekara.',
  '137061': 'Vlada mijenja zakon koji štiti građane kao kupce — uređuje pravo na reklamaciju, povrat robe, zabranu varljivog oglašavanja i nepoštenih ugovornih odredbi.',
  '137060': 'Vlada hitno mijenja zakon koji regulira odvjetničku profesiju — uvjete za postajanje odvjetnikom, pravila struke i nadzor nad odvjetnicima koji zastupaju stranke pred sudom.',
  '137059': 'Vlada podnosi Saboru godišnje izvješće o radu policije u 2025. godini s podatcima o broju kaznenih djela, intervencija i ostalim pokazateljima policijskog djelovanja.',
  '137058': 'Vlada predlaže zakon koji uređuje kako Hrvatska surađuje s ostalim zemljama EU-a u kaznenim predmetima — primjerice pri izručivanju osumnjičenih ili razmjeni dokaza.',
  '137057': 'Odbor Sabora predlaže razrješenje dosadašnjeg guvernera Hrvatske narodne banke s te dužnosti.',
  '137056': 'Predlaže se razrješenje jednog člana i imenovanje nove članice Državnog povjerenstva koje procjenjuje štete nastale od poplava, potresa i drugih prirodnih katastrofa.',
  '137055': 'Predlaže se promjena u izaslanstvu Sabora koje zastupa Hrvatsku u Parlamentarnoj skupštini NATO-a — razrješuje se dosadašnji zamjenik voditelja i imenuje novi.',
  '137054': 'Klub zastupnika SDP-a predlaže izmjene zakona koji uređuje rad restorana, kafića, hotela i ostalih ugostiteljskih objekata, uključujući uvjete rada zaposlenika i prava gostiju.',
  '137053': 'Vlada predlaže izmjene zakona koji uređuje rad Državnoodvjetničkog vijeća — neovisnog tijela zaduženog za imenovanje i nadzor državnih odvjetnika.',
  '137052': 'Vlada predlaže izmjene zakona koji uređuje Državno sudbeno vijeće — tijelo odgovorno za imenovanje, napredovanje i razrješenje sudaca u Republici Hrvatskoj.',
  '137051': 'Vlada predlaže izmjene zakona koji uređuje rad Pravosudne akademije — ustanove koja obrazuje i usavršava suce, državne odvjetnike i ostale pravosudne djelatnike.',
  '137050': 'Vlada mijenja zakon koji uređuje ulazak, boravak i rad stranaca u Hrvatskoj — od turista do radnih migranata — usklađujući ga s europskim propisima o migracijama.',
  '137049': 'Vlada donosi zakon koji postavlja pravni okvir za eventualni razvoj nuklearne energetike u civilne svrhe u Hrvatskoj, uključujući uvjete za istraživanje i gradnju nuklearnih postrojenja.',
  '137048': 'Vlada hitno donosi novi zakon koji uređuje poslovanje HBOR-a — državne razvojne banke koja financira infrastrukturne projekte, mala poduzeća i izvoznike.',
  '137047': 'Na prijedlog predsjednika Republike, Sabor bira novu predsjednicu Vrhovnog suda — najvišeg suda u Hrvatskoj koji osigurava jedinstvenu primjenu zakona.',
  '137046': 'Sabor odlučuje hoće li odobriti nastavak kaznenog postupka protiv zastupnika Darija Hrebaka, koji kao saborski zastupnik uživa imunitet koji ga štiti od progona za određena kaznena djela.',
  '137045': 'Predlaže se promjena u sastavu Odbora za rad, mirovinski sustav i socijalno partnerstvo — razrješuje se jedan dosadašnji član i bira novi.',
  '137044': 'Vlada hitno mijenja zakon koji propisuje kako se postupa s bankama i investicijskim društvima u financijskim poteškoćama, kako bi se zaštitili štediše i spriječio širi financijski slom.',
  '137043': 'Vlada hitno mijenja zakon koji uređuje postupak gašenja banaka koje ne mogu nastaviti poslovati — kako se rasprodaje imovina i isplaćuju tražbine vjerovnika i štediša.',
  '137042': 'Sabor potvrđuje ugovor kojim Hrvatska uzima zajam od Svjetske banke namijenjen jačanju otpornosti na prirodne katastrofe i unaprjeđenju sustava upravljanja u kriznim situacijama.',
  '137041': 'Klub zastupnika SDP-a predlaže dopunu Obiteljskog zakona koji uređuje brak, roditeljska prava, skrbništvo, uzdržavanje i ostale obiteljske odnose.',
  '137040': 'Povjerenstvo zaduženo za nadzor nad domovima za starije i nemoćne te ostalim ustanovama socijalne skrbi podnosi Saboru godišnje izvješće o svom radu u 2024. godini.',
  '137039': 'Vlada hitno mijenja zakon koji propisuje standarde kvalitete i sigurnosti za građevne materijale — cement, čelik, opeku i slično — koji se koriste pri gradnji zgrada i infrastrukture.',
};

let count = 0;
for (const vote of data) {
  if (summaries[vote.vote_id]) {
    vote.summary = summaries[vote.vote_id];
    count++;
  }
}

writeFileSync(path, JSON.stringify(data, null, 2), 'utf-8');
console.log(`Written: ${count} summaries`);
const total = data.filter(v => v.summary).length;
console.log(`Total with summary: ${total} / ${data.length}`);
