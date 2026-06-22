import { readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const path = __dirname + '/../data/2026.json';
const data = JSON.parse(readFileSync(path, 'utf-8'));

const summaries = {
  '137038': 'Vlada izvještava Sabor o tome koliko je napredovalo ostvarivanje ciljeva Nacionalne razvojne strategije do 2030. — dugoročnog plana koji određuje smjer razvoja Hrvatske u gospodarstvu, obrazovanju, okolišu i kvaliteti života.',
  '137037': 'Vlada predlaže zakon koji utvrđuje popis bolesti uzrokovanih radom — poput onih od izloženosti kemikalijama ili buci — na temelju kojeg radnici mogu ostvariti pravo na naknadu štete.',
  '137036': 'Vlada mijenja zakon koji uređuje obvezne zdravstvene preglede za radnike koji su bili izloženi azbestu, opasnoj tvari koja može uzrokovati teške bolesti pluća.',
  '137035': 'Vlada mijenja zakon koji uređuje pravo radnika oboljelih zbog izloženosti azbestu na novčanu naknadu i ostale oblike obeštećenja.',
  '137034': 'Vlada mijenja zakon koji uređuje legalizaciju bespravno izgrađenih zgrada — uvjete, postupak i naknade za objekte koji su izgrađeni bez valjane građevinske dozvole.',
  '137033': 'Sabor potvrđuje porezni sporazum s Australijom koji osigurava da građani i tvrtke koji ostvaruju prihode u objema državama ne plaćaju porez na isti dohodak dvaput.',
  '137032': 'Sabor potvrđuje porezni sporazum s Novim Zelandom koji osigurava da građani i tvrtke koji ostvaruju prihode u objema državama ne plaćaju porez na isti dohodak dvaput.',
  '137031': 'Vlada hitno dopunjuje Zakon o PDV-u, radi usklađivanja s europskim propisima ili uvođenja promjene poreznih stopa za određene kategorije roba ili usluga.',
  '137030': 'Vlada mijenja zakon koji propisuje kako državna tijela i javne tvrtke moraju provoditi natječaje i nabavljati robu, radove i usluge — radi veće transparentnosti i sprječavanja korupcije.',
  '137029': 'Vlada predlaže izmjene zakona koji omogućuje građanima u dubokim dugovima da kroz sudski postupak stečaja dobiju novu financijsku šansu i oslobode se dijela ili svih obveza.',
  '137028': 'Vlada donosi novi zakon koji uređuje politiku regionalnog razvoja — kako se planiraju i financiraju ulaganja u manje razvijene dijelove Hrvatske kako bi se smanjile razlike između regija.',
  '137027': 'Vlada po prvi put u čitanju uvodi zakon koji štiti aktiviste, novinare i druge osobe u javnom životu od zlouporabe sudskih tužbi kojima ih se nastoji ušutkati (tzv. SLAPP tužbe).',
  '137026': 'Predsjednik Vlade izvještava Sabor o zaključcima i temama koje su čelnici zemalja EU-a razmatrali na redovnom sastanku Europskog vijeća u ožujku 2026. godine.',
  '137025': 'Sabor potvrđuje izmjene Aarhuške konvencije koja jamči građanima pravo na informacije o stanju okoliša, sudjelovanje u odlučivanju o okolišnim pitanjima i pristup sudovima.',
  '137024': 'Sabor potvrđuje međunarodni ugovor kojim Hrvatska pristupa mehanizmu prijateljstva i suradnje s državama jugoistočne Azije, jačajući diplomatske i gospodarske veze s tom regijom.',
  '137023': 'Vlada donosi zakon kojim se uređuju mjere za osiguranje dostupnih stanova po prihvatljivim cijenama — namijenjeno građanima koji si na tržištu ne mogu priuštiti kupnju ili najam nekretnine.',
  '137022': 'Vlada mijenja zakon koji uređuje telekomunikacijski sektor — mobilne mreže, internet, televiziju i poštanske usluge — usklađujući ga s najnovijim europskim propisima.',
  '137021': 'Vlada hitno dopunjuje zakon koji uređuje burzu i trgovanje vrijednosnim papirima u Hrvatskoj, radi usklađivanja s novim europskim propisima o financijskim tržištima.',
  '137020': 'Vlada predlaže izmjene temeljnog zakona koji uređuje prekršajne postupke — lakše povrede zakona za koje se izriču novčane kazne ili opomene, a ne zatvorske kazne.',
  '137019': 'Vlada po prvi put u čitanju predlaže izmjene temeljnog zakona koji uređuje ugovore i obveze između građana i tvrtki — od kupoprodaje i najma do odgovornosti za štetu.',
  '137018': 'Šesnaest oporbenjih zastupnika predlaže osnivanje saborskog istražnog povjerenstva koje bi utvrdilo zašto institucije nisu uspjele spriječiti ubojstva žena počinjena od strane partnera ili bivših partnera.',
  '137017': 'Sabor je primio na znanje da zastupnik Krešo Beljak privremeno stavlja u mirovanje svoj mandat, a umjesto njega zastupničku dužnost preuzima zamjenik Darko Vuletić.',
  '137016': 'Vlada izvještava Sabor o tome koliko je europskog novca povučeno i potrošeno u drugoj polovici 2024. — iz fondova koji financiraju razvoj, infrastrukturu i zapošljavanje u Hrvatskoj.',
  '137015': 'Vlada izvještava Sabor o rezultatima politike razvoja hrvatskih otoka u 2024. godini — što je učinjeno za poboljšanje života, prometne povezanosti i gospodarstva na otocima.',
  '137014': 'Ravnatelj HRT-a podnosi Saboru godišnje izvješće o radu i financijskom poslovanju Hrvatske radiotelevizije, javnog medijskog servisa koji se financira pretplatom.',
  '137013': 'Hrvatska narodna banka izvještava Sabor o stanju financijskog sustava i kretanju cijena u prvoj polovici 2025. godine, u okviru zajedničke europske monetarne politike.',
  '137012': 'Hrvatska narodna banka izvještava Sabor o stanju financijskog sustava i kretanju cijena u drugoj polovici 2024. godine.',
  '137011': 'Vrhovni sud podnosi Saboru godišnje izvješće o stanju pravosuđa u 2024. godini — koliko je predmeta riješeno, koliko ih čeka na rješavanje i kakvi su izazovi u sudskom sustavu.',
  '137010': 'Vrhovni sud podnosi Saboru zakašnjelo izvješće o stanju pravosuđa u 2022. godini s podatcima o radu sudova i problemima s kojima se susreće sudski sustav.',
  '137009': 'Vrhovni sud podnosi Saboru izvješće o stanju pravosuđa u 2023. godini s podatcima o broju riješenih predmeta, dugotrajnosti postupaka i funkcioniranju sudskog sustava.',
  '137008': 'Državni ured za reviziju izvještava Sabor o tome jesu li gradovi i općine proveli preporuke iz ranijih revizija kojima se tražila učinkovitija uprava komunalnom infrastrukturom — vodovodom, kanalizacijom i odlagalištima.',
  '137007': 'Vlada izvještava Sabor o povlačenju i trošenju europskih sredstava u prvoj polovici 2025. — iz fondova koji financiraju razvoj, infrastrukturu i zapošljavanje u Hrvatskoj.',
  '137006': 'Vlada usklađuje zakon s europskim propisima o financijskim referentnim vrijednostima — indeksima poput EURIBOR-a koji se koriste za izračun kamatnih stopa na kredite i financijske instrumente.',
  '137005': 'Vlada usklađuje hrvatsko zakonodavstvo s europskom uredbom koja obvezuje energetski sektor — naftu, plin i ugljen — na mjerenje i smanjenje emisija metana, snažnog stakleničkog plina.',
  '137004': 'Vlada po prvi put u čitanju predlaže izmjene zakona koji štiti građane kao kupce — uređuje reklamacije, povrat robe, zabranu varljivog oglašavanja i nepoštenih ugovornih odredbi.',
  '137003': 'Vlada hitno mijenja Zakon o PDV-u, radi usklađivanja s europskim propisima ili promjene poreznih stopa za određene kategorije roba ili usluga.',
  '137002': 'Vlada predlaže razrješenje zamjenika ravnatelja Agencije za zaštitu osobnih podataka (AZOP) — tijela koje nadzire kako institucije i tvrtke postupaju s osobnim podacima građana.',
  '137001': 'Vlada predlaže proglašenje posebnog dana posvećenog posvojiteljima — osobama koje su pravno preuzele brigu o djetetu bez roditeljske skrbi i postale mu obitelj.',
  '137000': 'Vlada po prvi put u čitanju predlaže zakon koji uređuje rad agencija za nekretnine — tko smije posredovati pri kupnji ili najmu nekretnina i kako se štite kupci i prodavatelji.',
  '136999': 'Vlada donosi zakon koji uređuje prava i obveze putnika i željezničkih prijevoznika — što se događa u slučaju kašnjenja, otkazivanja vlaka ili gubitka prtljage.',
  '136998': 'Predlaže se imenovanje novih članova odbora koji dodjeljuje Nagradu Vladimir Nazor — prestižno državno odličje za izuzetan doprinos hrvatskoj kulturi i umjetnosti.',
  '136997': 'Predlaže se promjena u sastavu odbora koji dodjeljuje Nagradu Ivan Filipović — odlikovanje za izuzetan doprinos hrvatskom obrazovanju i pedagogiji.',
  '136996': 'Klub zastupnika Možemo! predlaže zakon koji bi zaštitio djecu u digitalnom okruženju — od štetnih sadržaja na internetu, platformama društvenih mreža i u online igrama.',
  '136995': 'Vlada izvještava Sabor o poslovnim rezultatima slobodnih zona u 2024. — posebnih područja s povoljnijim carinskim i poreznim uvjetima koja privlače strane ulagače i potiču izvoz.',
  '136994': 'Vlada izvještava Sabor o stanju biračkih spiskova na kraju trećeg tromjesečja 2025. — koliko birača ima pravo glasati i kako su raspoređeni po izbornim jedinicama.',
  '136993': 'Državni ured za reviziju izvještava Sabor o nalazima neovisne provjere državnog proračuna za 2024. godinu — je li novac trošen zakonito i namjenski.',
  '136992': 'Državni ured za reviziju izvještava Sabor o financijskom poslovanju svih parlamentarnih stranaka i nezavisnih zastupnika za 2024. godinu — kako su trošili javna sredstva za stranačke aktivnosti.',
  '136991': 'Vlada predlaže plan koji utvrđuje koji će se zakoni u 2026. godini uskladiti s europskim propisima — obvezan godišnji dokument koji prati prilagodbu hrvatskog prava standardima EU-a.',
  '136990': 'Vlada predlaže proglašenje posebnog tjedna posvećenog hrvatskoj dijaspori — Hrvatima koji žive izvan domovine, koji bi se obilježavao kulturnim i društvenim događanjima.',
  '136989': 'Vlada po prvi put u čitanju predlaže izmjene zakona koji uređuje azil i privremenu zaštitu izbjeglica i tražitelja azila u Hrvatskoj, usklađujući ga s europskim migracijskim propisima.',
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
