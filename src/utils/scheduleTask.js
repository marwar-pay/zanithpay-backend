import cron from "node-cron";
import axios from "axios";
import userDB from "../models/user.model.js";
import payOutModelGenerate from "../models/payOutGenerate.model.js";
import walletModel from "../models/Ewallet.model.js";
import payOutModel from "../models/payOutSuccess.model.js";
import LogModel from "../models/Logs.model.js";
import { Mutex } from "async-mutex";
import qrGenerationModel from "../models/qrGeneration.model.js";
import oldQrGenerationModel from "../models/oldQrGeneration.model.js";
import mongoose from "mongoose";
import Log from "../models/Logs.model.js";
import callBackResponseModel from "../models/callBackResponse.model.js";
import payInModel from "../models/payIn.model.js";
import moment from "moment";
import upiWalletModel from "../models/upiWallet.model.js";
import EwalletModel from "../models/Ewallet.model.js";
// const matchedTrxIds = [
//     "seabird5519911",
//     "seabird5519914",
//     "seabird5519924",
//     "seabird5519941",
//     "seabird5519958",
//     "seabird5519962",
//     "seabird5519975",
//     "seabird5519986",
//     "seabird5519989",
//     "seabird5520022",
//     "seabird5520046",
//     "seabird5520066",
//     "seabird5520224",
//     "seabird5520263",
//     "seabird5520379",
//     "seabird5520409",
//     "seabird5520423",
//     "seabird5520427",
//     "seabird5520447",
//     "seabird5520489",
//     "seabird5520505",
//     "seabird5520518",
//     "seabird5520524",
//     "seabird5520538",
//     "seabird5520548",
//     "seabird5520601",
//     "seabird5520674",
//     "seabird5520689",
//     "seabird5520695",
//     "seabird5520768",
//     "seabird5520814",
//     "seabird5520828",
//     "seabird5520860",
//     "seabird5520892",
//     "seabird5520961",
//     "seabird5520993",
//     "seabird5521021",
//     "seabird5521033",
//     "seabird5521069",
//     "seabird5521083",
//     "seabird5521099",
//     "seabird5521118",
//     "seabird5521199",
//     "seabird5521316",
//     "seabird5521535",
//     "seabird5521694",
//     "seabird5521716",
//     "seabird5521771",
//     "seabird5521861",
//     "seabird5522005",
//     "seabird5522027",
//     "seabird5522033",
//     "seabird5538610",
//     "seabird5538867",
//     "seabird5538956",
//     "seabird5539042",
//     "seabird5539076",
//     "seabird5539110",
//     "seabird5539163",
//     "seabird5539200",
//     "seabird5539288",
//     "seabird5539341",
//     "seabird5539383",
//     "seabird5539507",
//     "seabird5539741",
//     "seabird5539900",
//     "seabird5539996",
//     "seabird5540352",
//     "seabird5540408",
//     "seabird5544364",
//     "seabird5544403",
//     "seabird5544973",
//     "seabird5545383",
//     "seabird5545596",
//     "seabird5545861",
//     "seabird5545897",
//     "seabird5546150",
//     "seabird5546196",
//     "seabird5546267",
//     "seabird5541552",
//     "seabird5541566",
//     "seabird5532647",
//     "seabird5546649",
//     "seabird5546762",
//     "seabird5546818",
//     "seabird5547061",
//     "seabird5547183",
//     "seabird5547456",
//     "seabird5547619",
//     "seabird5547710",
//     "seabird5547795",
//     "seabird5547925",
//     "seabird5547966",
//     "seabird5548097",
//     "seabird5548229",
//     "seabird5548292",
//     "seabird5548351",
//     "seabird5548398",
//     "seabird5548460",
//     "seabird5548578",
//     "seabird5548599",
//     "seabird5548680",
//     "seabird5548712",
//     "seabird5532617",
//     "seabird5548776",
//     "seabird5548858",
//     "seabird5548944",
//     "seabird5549106",
//     "seabird5549184",
//     "seabird5549210",
//     "seabird5549318",
//     "seabird5549482",
//     "seabird5549549",
//     "seabird5549772",
//     "seabird5549985",
//     "seabird5550072",
//     "seabird5550308",
//     "seabird5550351",
//     "seabird5550412",
//     "seabird5550807",
//     "seabird5527228",
//     "seabird5527373",
//     "seabird5527509",
//     "seabird5550910",
//     "seabird5527576",
//     "seabird5527591",
//     "seabird5527723",
//     "seabird5527885",
//     "seabird5551006",
//     "seabird5527897",
//     "seabird5551326",
//     "seabird5551413",
//     "seabird5551517",
//     "seabird5551911",
//     "seabird5552114",
//     "seabird5552214",
//     "seabird5552309",
//     "seabird5553009",
//     "seabird5553214",
//     "seabird5553310",
//     "seabird5553619",
//     "seabird5553713",
//     "seabird5553914",
//     "seabird5554116",
//     "seabird5554316",
//     "seabird5554416",
//     "seabird5554611",
//     "seabird5554712",
//     "seabird5554917",
//     "seabird5555122",
//     "seabird5555214",
//     "seabird5555523",
//     "seabird5555622",
//     "seabird5555716",
//     "seabird5555916",
//     "seabird5556321",
//     "seabird5556520",
//     "seabird5556613",
//     "seabird5556714",
//     "seabird5556921",
//     "seabird5557022",
//     "seabird5557117",
//     "seabird5557221",
//     "seabird5557320",
//     "seabird5557414",
//     "seabird5557914",
//     "seabird5558114",
//     "seabird5558317",
//     "seabird5558516",
//     "seabird5558565",
//     "seabird5558589",
//     "seabird5558613",
//     "seabird5558631",
//     "seabird5558656",
//     "seabird5558672",
//     "seabird5558705",
//     "seabird5558722",
//     "seabird5558782",
//     "seabird5526665",
//     "seabird5558811",
//     "seabird5526912",
//     "seabird5558833",
//     "seabird5558869",
//     "seabird5558901",
//     "seabird5558972",
//     "seabird5559065",
//     "seabird5559074",
//     "seabird5559218",
//     "seabird5523643",
//     "seabird5525449",
//     "seabird5559311",
//     "seabird5559350",
//     "seabird5559398",
//     "seabird5559465",
//     "seabird5559504",
//     "seabird5559514",
//     "seabird5559527",
//     "seabird5559553",
//     "seabird5559572",
//     "seabird5559586",
//     "seabird5559618",
//     "seabird5559637",
//     "seabird5559653",
//     "seabird5559672",
//     "seabird5559695",
//     "seabird5375771",
//     "seabird5376235",
//     "seabird5561113",
//     "seabird5561235",
//     "seabird5561280",
//     "seabird5561349",
//     "seabird5561388",
//     "seabird5561455",
//     "seabird5561505",
//     "seabird5561624",
//     "seabird5561686",
//     "seabird5561762",
//     "seabird5561806",
//     "seabird5561820",
//     "seabird5562081",
//     "seabird5562239",
//     "seabird5562296",
//     "seabird5562393",
//     "seabird5562499",
//     "seabird5562578",
//     "seabird5562634",
//     "seabird5562885",
//     "seabird5562959",
//     "seabird5563037",
//     "seabird5563102",
//     "seabird5563195",
//     "seabird5563275",
//     "seabird5563382",
//     "seabird5563400",
//     "seabird5563463",
//     "seabird5563540",
//     "seabird5563994",
//     "seabird5564082",
//     "seabird5564192",
//     "seabird5564258",
//     "seabird5564425",
//     "seabird5564507",
//     "seabird5564573",
//     "seabird5564632",
//     "seabird5564675",
//     "seabird5528521",
//     "seabird5528656",
//     "seabird5528823",
//     "seabird5564933",
//     "seabird5528826",
//     "seabird5528916",
//     "seabird5529071",
//     "seabird5529173",
//     "seabird5530508",
//     "seabird5530567",
//     "seabird5530772",
//     "seabird5565257",
//     "seabird5565468",
//     "seabird5565524",
//     "seabird5565603",
//     "seabird5565682",
//     "seabird5565778",
//     "seabird5565977",
//     "seabird5566071",
//     "seabird5566114",
//     "seabird5566204",
//     "seabird5566222",
//     "seabird5566257",
//     "seabird5566300",
//     "seabird5566348",
//     "seabird5566381",
//     "seabird5566434",
//     "seabird5566463",
//     "seabird5566515",
//     "seabird5566820",
//     "seabird5566968",
//     "seabird5567041",
//     "seabird5581596",
//     "seabird5581660",
//     "seabird5581856",
//     "seabird5581914",
//     "seabird5582294",
//     "seabird5582391",
//     "seabird5582489",
//     "seabird5582545",
//     "seabird5582699",
//     "seabird5582729",
//     "seabird5582996",
//     "seabird5583790",
//     "seabird5583988",
//     "seabird5584235",
//     "seabird5584720",
//     "seabird5584745",
//     "seabird5584908",
//     "seabird5584953",
//     "seabird5585568",
//     "seabird5586117",
//     "seabird5586291",
//     "seabird5586323",
//     "seabird5586505",
//     "seabird5586558",
//     "seabird5588455",
//     "seabird5588524",
//     "seabird5589015",
//     "seabird5589282",
//     "seabird5589583",
//     "seabird5589620",
//     "seabird5589673",
//     "seabird5589743",
//     "seabird5589801",
//     "seabird5590818",
//     "seabird5590992",
//     "seabird5591114",
//     "seabird5591508",
//     "seabird5591618",
//     "seabird5591726",
//     "seabird5591771",
//     "seabird5592127",
//     "seabird5592254",
//     "seabird5592677",
//     "seabird5592731",
//     "seabird5599587",
//     "seabird5599600",
//     "seabird5599612",
//     "seabird5599623",
//     "seabird5530344",
//     "seabird5530417",
//     "seabird5599646",
//     "seabird5599649",
//     "seabird5599699",
//     "seabird5599715",
//     "seabird5599841",
//     "seabird5599854",
//     "seabird5599936",
//     "seabird5599948",
//     "seabird5599957",
//     "seabird5600004",
//     "seabird5600016",
//     "seabird5530247",
//     "seabird5530256",
//     "seabird5530236",
//     "seabird5530280",
//     "seabird5520061",
//     "seabird5520012",
//     "seabird5519976",
//     "seabird5519925",
//     "seabird5519925",
//     "seabird5520012",
//     "seabird5519976",
//     "seabird5520127",
//     "seabird5520061",
//     "seabird5520950",
//     "seabird5520480",
//     "seabird5520508",
//     "seabird5520580",
//     "seabird5520817",
//     "seabird5520698",
//     "seabird5520829",
//     "seabird5520221",
//     "seabird5520484",
//     "seabird5520508",
//     "seabird5520557",
//     "seabird5520377",
//     "seabird5520390",
//     "seabird5520378",
//     "seabird5520377",
//     "seabird5520390",
//     "seabird5520480",
//     "seabird5520378",
//     "seabird5520411",
//     "seabird5520408",
//     "seabird5520226",
//     "seabird5520338",
//     "seabird5520442",
//     "seabird5521202",
//     "seabird5521117",
//     "seabird5521168",
//     "seabird5520876",
//     "seabird5521202",
//     "seabird5520698",
//     "seabird5520408",
//     "seabird5521117",
//     "seabird5520442",
//     "seabird5520484",
//     "seabird5521168",
//     "seabird5520557",
//     "seabird5520950",
//     "seabird5520411",
//     "seabird5520226",
//     "seabird5520817",
//     "seabird5521312",
//     "seabird5521387",
//     "seabird5521282",
//     "seabird5521329",
//     "seabird5521494",
//     "seabird5521522",
//     "seabird5521772",
//     "seabird5521977",
//     "seabird5521839",
//     "seabird5601097",
//     "seabird5601140",
//     "seabird5601148",
//     "seabird5601213",
//     "seabird5601308",
//     "seabird5601530",
//     "seabird5601601",
//     "seabird5601631",
//     "seabird5601693",
//     "seabird5601745",
//     "seabird5601845",
//     "seabird5601905",
//     "seabird5601971",
//     "seabird5602056",
//     "seabird5602085",
//     "seabird5602118",
//     "seabird5602158",
//     "seabird5602203",
//     "seabird5602217",
//     "seabird5602247",
//     "seabird5602308",
//     "seabird5602396",
//     "seabird5602412",
//     "seabird5602418",
//     "seabird5602461",
//     "seabird5602505",
//     "seabird5602587",
//     "seabird5602603",
//     "seabird5602608",
//     "seabird5602649",
//     "seabird5602660",
//     "seabird5602669",
//     "seabird5602685",
//     "seabird5602711",
//     "seabird5602720",
//     "seabird5602728",
//     "seabird5602752",
//     "seabird5602767",
//     "seabird5602769",
//     "seabird5602791",
//     "seabird5602803",
//     "seabird5602812",
//     "seabird5602834",
//     "seabird5602849",
//     "seabird5602850",
//     "seabird5602873",
//     "seabird5602886",
//     "seabird5602896",
//     "seabird5602913",
//     "seabird5602920",
//     "seabird5602944",
//     "seabird5602957",
//     "seabird5602974",
//     "seabird5602988",
//     "seabird5603007",
//     "seabird5603027",
//     "seabird5603047",
//     "seabird5603074",
//     "seabird5603088",
//     "seabird5603099",
//     "seabird5603119",
//     "seabird5603136",
//     "seabird5603144",
//     "seabird5603168",
//     "seabird5603185",
//     "seabird5603204",
//     "seabird5603231",
//     "seabird5603240",
//     "seabird5603257",
//     "seabird5603272",
//     "seabird5603297",
//     "seabird5603324",
//     "seabird5603357",
//     "seabird5603368",
//     "seabird5603389",
//     "seabird5603514",
//     "seabird5603531",
//     "seabird5603580",
//     "seabird5603639",
//     "seabird5603637",
//     "seabird5603632",
//     "seabird5603641",
//     "seabird5603645",
//     "seabird5603646",
//     "seabird5603653",
//     "seabird5603651",
//     "seabird5603656",
//     "seabird5603661",
//     "seabird5603647",
//     "seabird5603682",
//     "seabird5603664",
//     "seabird5603687",
//     "seabird5603667",
//     "seabird5603674",
//     "seabird5603686",
//     "seabird5603697",
//     "seabird5603735",
//     "seabird5603764",
//     "seabird5603790",
//     "seabird5603795",
//     "seabird5603814",
//     "seabird5603830",
//     "seabird5603845",
//     "seabird5600771",
//     "seabird5603852",
//     "seabird5603874",
//     "seabird5603880",
//     "seabird5603894",
//     "seabird5603937",
//     "seabird5603948",
//     "seabird5603970",
//     "seabird5603997",
//     "seabird5604014",
//     "seabird5604022",
//     "seabird5604049",
//     "seabird5604105",
//     "seabird5604147",
//     "seabird5604163",
//     "seabird5604190",
//     "seabird5604230",
//     "seabird5604274",
//     "seabird5604307",
//     "seabird5604387",
//     "seabird5604410",
//     "seabird5530245",
//     "seabird5604449",
//     "seabird5604478",
//     "seabird5604574",
//     "seabird5604677",
//     "seabird5529398",
//     "seabird5604683",
//     "seabird5600790",
//     "seabird5604705",
//     "seabird5604749",
//     "seabird5604794",
//     "seabird5604912",
//     "seabird5604944",
//     "seabird5605032",
//     "seabird5605040",
//     "seabird5605073",
//     "seabird5605087",
//     "seabird5605107",
//     "seabird5605185",
//     "seabird5605217",
//     "seabird5605255",
//     "seabird5605277",
//     "seabird5605300",
//     "seabird5605342",
//     "seabird5605382",
//     "seabird5605405",
//     "seabird5605426",
//     "seabird5605475",
//     "seabird5605539",
//     "seabird5605581",
//     "seabird5605722",
//     "seabird5605743",
//     "seabird5605845",
//     "seabird5605904",
//     "seabird5605953",
//     "seabird5605984",
//     "seabird5606011",
//     "seabird5606035",
//     "seabird5606126",
//     "seabird5606211",
//     "seabird5606275",
//     "seabird5606378",
//     "seabird5606439",
//     "seabird5606514",
//     "seabird5606612",
//     "seabird5606707",
//     "seabird5606782",
//     "seabird5606880",
//     "seabird5606987",
//     "seabird5607081",
//     "seabird5607186",
//     "seabird5607300",
//     "seabird5607488",
//     "seabird5607590",
//     "seabird5607683",
//     "seabird5607781",
//     "seabird5607983",
//     "seabird5608080",
//     "seabird5608183",
//     "seabird5608279",
//     "seabird5608383",
//     "seabird5608482",
//     "seabird5608582",
//     "seabird5608781",
//     "seabird5609179",
//     "seabird5609681",
//     "seabird5609782",
//     "seabird5610083",
//     "seabird5610481",
//     "seabird5610583",
//     "seabird5610979",
//     "seabird5612190",
//     "seabird5612558",
//     "seabird5612634",
//     "seabird5612836",
//     "seabird5613055",
//     "seabird5613083",
//     "seabird5613197",
//     "seabird5613250",
//     "seabird5613461",
//     "seabird5613729",
//     "seabird5614192",
//     "seabird5614479",
//     "seabird5614641",
//     "seabird5615030",
//     "seabird5615059",
//     "seabird5615095",
//     "seabird5615187",
//     "seabird5615549",
//     "seabird5616081",
//     "seabird5616642",
//     "seabird5616750",
//     "seabird5616800",
//     "seabird5616848",
//     "seabird5616998",
//     "seabird5617448",
//     "seabird5617456",
//     "seabird5617495",
//     "seabird5617565",
//     "seabird5617585",
//     "seabird5617625",
//     "seabird5617670",
//     "seabird5617701",
//     "seabird5617768",
//     "seabird5617788",
//     "seabird5617805",
//     "seabird5617855",
//     "seabird5617891",
//     "seabird5617971",
//     "seabird5618272",
//     "seabird5618622",
//     "seabird5618692",
//     "seabird5635561",
//     "seabird5635606",
//     "seabird5635689",
//     "seabird5635768",
//     "seabird5635872",
//     "seabird5635948",
//     "seabird5635977",
//     "seabird5636037",
//     "seabird5636256",
//     "seabird5636309",
//     "seabird5636739",
//     "seabird5636776",
//     "seabird5636852",
//     "seabird5636869",
//     "seabird5636894",
//     "seabird5636948",
//     "seabird5636953",
//     "seabird5636977",
//     "seabird5637002",
//     "seabird5637037",
//     "seabird5637047",
//     "seabird5637063",
//     "seabird5637065",
//     "seabird5637076",
//     "seabird5637113",
//     "seabird5637115",
//     "seabird5637156",
//     "seabird5637172",
//     "seabird5637301",
//     "seabird5637331",
//     "seabird5637340",
//     "seabird5637374",
//     "seabird5637489",
//     "seabird5637519",
//     "seabird5637562",
//     "seabird5637541",
//     "seabird5637626",
//     "seabird5637650",
//     "seabird5637678",
//     "seabird5637720",
//     "seabird5637771",
//     "seabird5637778",
//     "seabird5637781",
//     "seabird5637804",
//     "seabird5637821",
//     "seabird5637843",
//     "seabird5637855",
//     "seabird5637886",
//     "seabird5637904",
//     "seabird5637922",
//     "seabird5637938",
//     "seabird5637935",
//     "seabird5637943",
//     "seabird5637972",
//     "seabird5637991",
//     "seabird5638123",
//     "seabird5638177",
//     "seabird5638188",
//     "seabird5638189",
//     "seabird5638202",
//     "seabird5638261",
//     "seabird5638289",
//     "seabird5638314",
//     "seabird5638307",
//     "seabird5638386",
//     "seabird5638394",
//     "seabird5638400",
//     "seabird5638428",
//     "seabird5638459",
//     "seabird5638467",
//     "seabird5638536",
//     "seabird5638625",
//     "seabird5638656",
//     "seabird5638746",
//     "seabird5638783",
//     "seabird5638793",
//     "seabird5638804",
//     "seabird5638819",
//     "seabird5638837",
//     "seabird5638846",
//     "seabird5638853",
//     "seabird5638859",
//     "seabird5638861",
//     "seabird5638874",
//     "seabird5638883",
//     "seabird5638888",
//     "seabird5638905",
//     "seabird5638920",
//     "seabird5638949",
//     "seabird5638952",
//     "seabird5638991",
//     "seabird5639010",
//     "seabird5639023",
//     "seabird5639069",
//     "seabird5639081",
//     "seabird5639099",
//     "seabird5639119",
//     "seabird5639124",
//     "seabird5639171",
//     "seabird5639177",
//     "seabird5639182",
//     "seabird5639192",
//     "seabird5639208",
//     "seabird5639211",
//     "seabird5639214",
//     "seabird5639216",
//     "seabird5639220",
//     "seabird5639223",
//     "seabird5639226",
//     "seabird5639245",
//     "seabird5639273",
//     "seabird5639277",
//     "seabird5639317",
//     "seabird5639334",
//     "seabird5639341",
//     "seabird5639352",
//     "seabird5582746",
//     "seabird5639385",
//     "seabird5639389",
//     "seabird5639426",
//     "seabird5639445",
//     "seabird5639463",
//     "seabird5639472",
//     "seabird5639518",
//     "seabird5639534",
//     "seabird5639556",
//     "seabird5639587",
//     "seabird5639618",
//     "seabird5639622",
//     "seabird5639632",
//     "seabird5639634",
//     "seabird5639649",
//     "seabird5639668",
//     "seabird5639713",
//     "seabird5639717",
//     "seabird5639743",
//     "seabird5639804",
//     "seabird5639842",
//     "seabird5639837",
//     "seabird5639900",
//     "seabird5639949",
//     "seabird5639948",
//     "seabird5640037",
//     "seabird5640048",
//     "seabird5640064",
//     "seabird5640077",
//     "seabird5640084",
//     "seabird5640117",
//     "seabird5640133",
//     "seabird5640166",
//     "seabird5640182",
//     "seabird5640190",
//     "seabird5640200",
//     "seabird5640247",
//     "seabird5640267",
//     "seabird5640278",
//     "seabird5640299",
//     "seabird5640311",
//     "seabird5640342",
//     "seabird5640364",
//     "seabird5640418",
//     "seabird5640425",
//     "seabird5640450",
//     "seabird5640480",
//     "seabird5640502",
//     "seabird5640530",
//     "seabird5640532",
//     "seabird5640593",
//     "seabird5640600",
//     "seabird5640612",
//     "seabird5640685",
//     "seabird5640726",
//     "seabird5640738",
//     "seabird5640864",
//     "seabird5640901",
//     "seabird5640920",
//     "seabird5640996",
//     "seabird5641066",
//     "seabird5641160",
//     "seabird5641297",
//     "seabird5641367",
//     "seabird5641507",
//     "seabird5641577",
//     "seabird5641583",
//     "seabird5641590",
//     "seabird5641593",
//     "seabird5641601",
//     "seabird5641627",
//     "seabird5641633",
//     "seabird5641635",
//     "seabird5641637",
//     "seabird5641659",
//     "seabird5641684",
//     "seabird5641689",
//     "seabird5641694",
//     "seabird5641701",
//     "seabird5641705",
//     "seabird5641711",
//     "seabird5641715",
//     "seabird5641720",
//     "seabird5641730",
//     "seabird5641739",
//     "seabird5641746",
//     "seabird5641757",
//     "seabird5641775",
//     "seabird5641780",
//     "seabird5641787",
//     "seabird5641794",
//     "seabird5641811",
//     "seabird5641821",
//     "seabird5641822",
//     "seabird5641830",
//     "seabird5641843",
//     "seabird5641883",
//     "seabird5641889",
//     "seabird5641892",
//     "seabird5641926",
//     "seabird5641935",
//     "seabird5641955",
//     "seabird5641965",
//     "seabird5641990",
//     "seabird5642000",
//     "seabird5642002",
//     "seabird5642004",
//     "seabird5642011",
//     "seabird5642017",
//     "seabird5642022",
//     "seabird5642024",
//     "seabird5642032",
//     "seabird5642045",
//     "seabird5642048",
//     "seabird5642057",
//     "seabird5642066",
//     "seabird5642072",
//     "seabird5642079",
//     "seabird5642090",
//     "seabird5642124",
//     "seabird5642138",
//     "seabird5642141",
//     "seabird5642197",
//     "seabird5642211",
//     "seabird5642212",
//     "seabird5642218",
//     "seabird5642232",
//     "seabird5642252",
//     "seabird5642261",
//     "seabird5642266",
//     "seabird5642269",
//     "seabird5642274",
//     "seabird5642277",
//     "seabird5642286",
//     "seabird5642291",
//     "seabird5642295",
//     "seabird5642310",
//     "seabird5642315",
//     "seabird5642329",
//     "seabird5642347",
//     "seabird5642350",
//     "seabird5642360",
//     "seabird5642364",
//     "seabird5642368",
//     "seabird5642374",
//     "seabird5642376",
//     "seabird5642379",
//     "seabird5642383",
//     "seabird5642387",
//     "seabird5642389",
//     "seabird5642393",
//     "seabird5642396",
//     "seabird5642397",
//     "seabird5642399",
//     "seabird5642404",
//     "seabird5642407",
//     "seabird5642410",
//     "seabird5642412",
//     "seabird5642415",
//     "seabird5642420",
//     "seabird5642423",
//     "seabird5642428",
//     "seabird5642430",
//     "seabird5642434",
//     "seabird5642440",
//     "seabird5642442",
//     "seabird5642444",
//     "seabird5642449",
//     "seabird5642453",
//     "seabird5642455",
//     "seabird5642459",
//     "seabird5642468",
//     "seabird5642475",
//     "seabird5642476",
//     "seabird5642481",
//     "seabird5642483",
//     "seabird5642484",
//     "seabird5642485",
//     "seabird5642488",
//     "seabird5642489",
//     "seabird5642490",
//     "seabird5642491",
//     "seabird5642496",
//     "seabird5642500",
//     "seabird5642503",
//     "seabird5642508",
//     "seabird5642512",
//     "seabird5642518",
//     "seabird5642521",
//     "seabird5642529",
//     "seabird5642533",
//     "seabird5642544",
//     "seabird5642553",
//     "seabird5642559",
//     "seabird5642565",
//     "seabird5642567",
//     "seabird5642571",
//     "seabird5642577",
//     "seabird5642578",
//     "seabird5642582",
//     "seabird5642586",
//     "seabird5642589",
//     "seabird5642591",
//     "seabird5642594",
//     "seabird5642600",
//     "seabird5642602",
//     "seabird5642609",
//     "seabird5642613",
//     "seabird5642619",
//     "seabird5642624",
//     "seabird5642628",
//     "seabird5642632",
//     "seabird5642638",
//     "seabird5642643",
//     "seabird5642650",
//     "seabird5642655",
//     "seabird5642661",
//     "seabird5642672",
//     "seabird5642675",
//     "seabird5642681",
//     "seabird5642682",
//     "seabird5642686",
//     "seabird5642691",
//     "seabird5642697",
//     "seabird5642702",
//     "seabird5642706",
//     "seabird5642707",
//     "seabird5642713",
//     "seabird5642718",
//     "seabird5642729",
//     "seabird5642733",
//     "seabird5642753",
//     "seabird5642768",
//     "seabird5642792",
//     "seabird5642828",
//     "seabird5642838",
//     "seabird5642885",
//     "seabird5642976",
//     "seabird5643066",
//     "seabird5665059",
//     "seabird5665479",
//     "seabird5665563",
//     "seabird5665760",
//     "seabird5665781",
//     "seabird5665999",
//     "seabird5666014",
//     "seabird5666058",
//     "seabird5666077",
//     "seabird5666215",
//     "seabird5666287",
//     "seabird5666341",
//     "seabird5666390",
//     "seabird5666449",
//     "seabird5666502",
//     "seabird5666549",
//     "seabird5666587",
//     "seabird5666610",
//     "seabird5579305",
//     "seabird5578963",
//     "seabird5666660",
//     "seabird5666695",
//     "seabird5666716",
//     "seabird5666730",
//     "seabird5666762",
//     "seabird5666855",
//     "seabird5666934",
//     "seabird5666978",
//     "seabird5667002",
//     "seabird5667017",
//     "seabird5667034",
//     "seabird5667035",
//     "seabird5667080",
//     "seabird5667125",
//     "seabird5667148",
//     "seabird5667191",
//     "seabird5667217",
//     "seabird5667272",
//     "seabird5667313",
//     "seabird5667327",
//     "seabird5667328",
//     "seabird5667335",
//     "seabird5667450",
//     "seabird5667452",
//     "seabird5667472",
//     "seabird5667511",
//     "seabird5667587",
//     "seabird5667642",
//     "seabird5667656",
//     "seabird5667684",
//     "seabird5667689",
//     "seabird5667696",
//     "seabird5667742",
//     "seabird5667755",
//     "seabird5667772",
//     "seabird5667785",
//     "seabird5667799",
//     "seabird5667806",
//     "seabird5667811",
//     "seabird5667859",
//     "seabird5667867",
//     "seabird5667885",
//     "seabird5667887",
//     "seabird5667904",
//     "seabird5667968",
//     "seabird5667987",
//     "seabird5668024",
//     "seabird5668035",
//     "seabird5668036",
//     "seabird5668043",
//     "seabird5668091",
//     "seabird5668106",
//     "seabird5668129",
//     "seabird5668161",
//     "seabird5668166",
//     "seabird5668185",
//     "seabird5668198",
//     "seabird5668208",
//     "seabird5668222",
//     "seabird5668231",
//     "seabird5668241",
//     "seabird5668252",
//     "seabird5668270",
//     "seabird5668276",
//     "seabird5668281",
//     "seabird5668323",
//     "seabird5668332",
//     "seabird5668335",
//     "seabird5668370",
//     "seabird5668375",
//     "seabird5668387",
//     "seabird5668405",
//     "seabird5668417",
//     "seabird5668427",
//     "seabird5668429",
//     "seabird5668439",
//     "seabird5668453",
//     "seabird5668459",
//     "seabird5668466",
//     "seabird5668474",
//     "seabird5668476",
//     "seabird5668484",
//     "seabird5668492",
//     "seabird5668494",
//     "seabird5668528",
//     "seabird5668557",
//     "seabird5668573",
//     "seabird5668581",
//     "seabird5668585",
//     "seabird5668593",
//     "seabird5668599",
//     "seabird5668604",
//     "seabird5668605",
//     "seabird5668626",
//     "seabird5668632",
//     "seabird5668637",
//     "seabird5668652",
//     "seabird5668664",
//     "seabird5668690",
//     "seabird5668718",
//     "seabird5668727",
//     "seabird5668734",
//     "seabird5668755",
//     "seabird5668762",
//     "seabird5668775",
//     "seabird5668778",
//     "seabird5668812",
//     "seabird5668813",
//     "seabird5668818",
//     "seabird5668844",
//     "seabird5668846",
//     "seabird5668922",
//     "seabird5668931",
//     "seabird5668999",
//     "seabird5669026",
//     "seabird5669046",
//     "seabird5669161",
//     "seabird5669197",
//     "seabird5669199",
//     "seabird5669264",
//     "seabird5669273",
//     "seabird5669284",
//     "seabird5669287",
//     "seabird5669593",
//     "seabird5669620",
//     "seabird5669686",
//     "seabird5669707",
//     "seabird5669846",
//     "seabird5670911",
//     "seabird5670955",
//     "seabird5671021",
//     "seabird5671032",
//     "seabird5671041",
//     "seabird5673862",
//     "seabird5673901",
//     "seabird5673915",
//     "seabird5673944",
//     "seabird5673951",
//     "seabird5674015",
//     "seabird5674064",
//     "seabird5674121",
//     "seabird5674132",
//     "seabird5674172",
//     "seabird5674203",
//     "seabird5674223",
//     "seabird5674237",
//     "seabird5674268",
//     "seabird5674332",
//     "seabird5674359",
//     "seabird5674407",
//     "seabird5674436",
//     "seabird5674466",
//     "seabird5674541",
//     "seabird5674640",
//     "seabird5674684",
//     "seabird5674692",
//     "seabird5674804",
//     "seabird5674943",
//     "seabird5674984",
//     "seabird5675089",
//     "seabird5675116",
//     "seabird5675178",
//     "seabird5675196",
//     "seabird5675267",
//     "seabird5675268",
//     "seabird5675288",
//     "seabird5675299",
//     "seabird5675345",
//     "seabird5675384",
//     "seabird5675454",
//     "seabird5675650",
//     "seabird5675718",
//     "seabird5675780",
//     "seabird5675787",
//     "seabird5675798",
//     "seabird5675816",
//     "seabird5675833",
//     "seabird5675860",
//     "seabird5630468",
//     "seabird5630464",
//     "seabird5630510",
//     "seabird5630586",
//     "seabird5630639",
//     "seabird5676334",
//     "seabird5676363",
//     "seabird5676371",
//     "seabird5676481",
//     "seabird5539607",
//     "seabird5538874",
//     "seabird5538611",
//     "seabird5539039",
//     "seabird5539219",
//     "seabird5538954",
//     "seabird5538921",
//     "seabird5539680",
//     "seabird5539712",
//     "seabird5539757",
//     "seabird5539205",
//     "seabird5539077",
//     "seabird5539111",
//     "seabird5540032",
//     "seabird5539378",
//     "seabird5539941",
//     "seabird5540411",
//     "seabird5539167",
//     "seabird5528225",
//     "seabird5546675",
//     "seabird5545709",
//     "seabird5548295",
//     "seabird5548404",
//     "seabird5549172",
//     "seabird5547796",
//     "seabird5548690",
//     "seabird5549490",
//     "seabird5549254",
//     "seabird5548842",
//     "seabird5545348",
//     "seabird5549198",
//     "seabird5549313",
//     "seabird5545756",
//     "seabird5548963",
//     "seabird5548214",
//     "seabird5550711",
//     "seabird5551214",
//     "seabird5551425",
//     "seabird5549784",
//     "seabird5553309",
//     "seabird5551520",
//     "seabird5552416",
//     "seabird5553221",
//     "seabird5549784",
//     "seabird5553616",
//     "seabird5527578",
//     "seabird5549884",
//     "seabird5551912",
//     "seabird5553119",
//     "seabird5551520",
//     "seabird5550928",
//     "seabird5553415",
//     "seabird5555217",
//     "seabird5554216",
//     "seabird5555015",
//     "seabird5555416",
//     "seabird5555118",
//     "seabird5555915",
//     "seabird5557814",
//     "seabird5557725",
//     "seabird5558227",
//     "seabird5556729",
//     "seabird5558324",
//     "seabird5556521",
//     "seabird5556221",
//     "seabird5558121",
//     "seabird5557420",
//     "seabird5559593",
//     "seabird5550928",
//     "seabird5559635",
//     "seabird5527578",
//     "seabird5558324",
//     "seabird5558826",
//     "seabird5554509",
//     "seabird5558674",
//     "seabird5558655",
//     "seabird5553119",
//     "seabird5559518",
//     "seabird5558876",
//     "seabird5558568",
//     "seabird5559062",
//     "seabird5559561",
//     "seabird5558655",
//     "seabird5558940",
//     "seabird5558674",
//     "seabird5558876",
//     "seabird5557420",
//     "seabird5559062",
//     "seabird5551425",
//     "seabird5557420",
//     "seabird5557814",
//     "seabird5554216",
//     "seabird5556221",
//     "seabird5556729",
//     "seabird5558324",
//     "seabird5558568",
//     "seabird5558227",
//     "seabird5555118",
//     "seabird5559635",
//     "seabird5553415",
//     "seabird5555217",
//     "seabird5553221",
//     "seabird5555915",
//     "seabird5550928",
//     "seabird5558121",
//     "seabird5559561",
//     "seabird5558940",
//     "seabird5561892",
//     "seabird5561513",
//     "seabird5558588",
//     "seabird5559593",
//     "seabird5555915",
//     "seabird5555015",
//     "seabird5561233",
//     "seabird5561811",
//     "seabird5559518",
//     "seabird5561389",
//     "seabird5561674",
//     "seabird5558975",
//     "seabird5553715",
//     "seabird5562009",
//     "seabird5564617",
//     "seabird5562735",
//     "seabird5562292",
//     "seabird5563456",
//     "seabird5563208",
//     "seabird5564348",
//     "seabird5563283",
//     "seabird5563700",
//     "seabird5563825",
//     "seabird5563884",
//     "seabird5563956",
//     "seabird5528659",
//     "seabird5562165",
//     "seabird5564678",
//     "seabird5563996",
//     "seabird5564513",
//     "seabird5565274",
//     "seabird5565605",
//     "seabird5565471",
//     "seabird5566263",
//     "seabird5565944",
//     "seabird5566927",
//     "seabird5565780",
//     "seabird5565826",
//     "seabird5566048",
//     "seabird5566510",
//     "seabird5565864",
//     "seabird5566502",
//     "seabird5566982",
//     "seabird5566416",
//     "seabird5566296",
//     "seabird5566205",
//     "seabird5565685",
//     "seabird5581225",
//     "seabird5581825",
//     "seabird5582381",
//     "seabird5582329",
//     "seabird5582547",
//     "seabird5583752",
//     "seabird5585777",
//     "seabird5586319",
//     "seabird5586382",
//     "seabird5590984",
//     "seabird5599663",
//     "seabird5588454",
//     "seabird5599651",
//     "seabird5599644",
//     "seabird5599603",
//     "seabird5599593",
//     "seabird5599627",
//     "seabird5599729",
//     "seabird5599813",
//     "seabird5599945",
//     "seabird5599855",
//     "seabird5599557",
//     "seabird5599689",
//     "seabird5601223",
//     "seabird5601363",
//     "seabird5601579",
//     "seabird5601692",
//     "seabird5601473",
//     "seabird5601077",
//     "seabird5601760",
//     "seabird5601899",
//     "seabird5601958",
//     "seabird5601992",
//     "seabird5602307",
//     "seabird5602189",
//     "seabird5602748",
//     "seabird5602651",
//     "seabird5602729",
//     "seabird5602636",
//     "seabird5602509",
//     "seabird5602476",
//     "seabird5602719",
//     "seabird5602607",
//     "seabird5602335",
//     "seabird5602051",
//     "seabird5602224",
//     "seabird5602084",
//     "seabird5602417",
//     "seabird5602698",
//     "seabird5602693",
//     "seabird5602804",
//     "seabird5602950",
//     "seabird5603090",
//     "seabird5603076",
//     "seabird5602839",
//     "seabird5602828",
//     "seabird5602897",
//     "seabird5602931",
//     "seabird5602865",
//     "seabird5603365",
//     "seabird5603025",
//     "seabird5603817",
//     "seabird5603094",
//     "seabird5603730",
//     "seabird5603855",
//     "seabird5604189",
//     "seabird5602813",
//     "seabird5603238",
//     "seabird5603586",
//     "seabird5603847",
//     "seabird5603803",
//     "seabird5604057",
//     "seabird5604747",
//     "seabird5602977",
//     "seabird5603938",
//     "seabird5604693",
//     "seabird5602973",
//     "seabird5604957",
//     "seabird5603867",
//     "seabird5603888",
//     "seabird5605278",
//     "seabird5605026",
//     "seabird5603911",
//     "seabird5603296",
//     "seabird5604547",
//     "seabird5604715",
//     "seabird5604483",
//     "seabird5605861",
//     "seabird5605964",
//     "seabird5605749",
//     "seabird5605301",
//     "seabird5605106",
//     "seabird5605344",
//     "seabird5603126",
//     "seabird5604435",
//     "seabird5605253",
//     "seabird5603701",
//     "seabird5605075",
//     "seabird5605224",
//     "seabird5605735",
//     "seabird5606220",
//     "seabird5605660",
//     "seabird5604233",
//     "seabird5603385",
//     "seabird5603183",
//     "seabird5602851",
//     "seabird5602910",
//     "seabird5604038",
//     "seabird5603999",
//     "seabird5603006",
//     "seabird5604167",
//     "seabird5605384",
//     "seabird5605582",
//     "seabird5604118",
//     "seabird5603961",
//     "seabird5604592",
//     "seabird5606127",
//     "seabird5603199",
//     "seabird5605419",
//     "seabird5603268",
//     "seabird5603179",
//     "seabird5603274",
//     "seabird5605894",
//     "seabird5603132",
//     "seabird5605477",
//     "seabird5604073",
//     "seabird5603154",
//     "seabird5606020",
//     "seabird5605560",
//     "seabird5608379",
//     "seabird5606281",
//     "seabird5613261",
//     "seabird5608293",
//     "seabird5608082",
//     "seabird5607980",
//     "seabird5608602",
//     "seabird5606788",
//     "seabird5610479",
//     "seabird5609780",
//     "seabird5607682",
//     "seabird5606712",
//     "seabird5607485",
//     "seabird5606531",
//     "seabird5607392",
//     "seabird5611090",
//     "seabird5609682",
//     "seabird5606879",
//     "seabird5606985",
//     "seabird5612181",
//     "seabird5606445",
//     "seabird5612080",
//     "seabird5613072",
//     "seabird5613402",
//     "seabird5612808",
//     "seabird5609984",
//     "seabird5612637",
//     "seabird5613721",
//     "seabird5606376",
//     "seabird5607792",
//     "seabird5614124",
//     "seabird5613546",
//     "seabird5614212",
//     "seabird5612676",
//     "seabird5614816",
//     "seabird5614259",
//     "seabird5614723",
//     "seabird5616509",
//     "seabird5614953",
//     "seabird5614882",
//     "seabird5615065",
//     "seabird5615201",
//     "seabird5615259",
//     "seabird5615789",
//     "seabird5617700",
//     "seabird5617499",
//     "seabird5617774",
//     "seabird5617767",
//     "seabird5617472",
//     "seabird5617580",
//     "seabird5618902",
//     "seabird5617266",
//     "seabird5617866",
//     "seabird5617663",
//     "seabird5618466",
//     "seabird5617627",
//     "seabird5617407",
//     "seabird5615671",
//     "seabird5617445",
//     "seabird5618801",
//     "seabird5618742",
//     "seabird5618860",
//     "seabird5635691",
//     "seabird5636895",
//     "seabird5636999",
//     "seabird5636854",
//     "seabird5637031",
//     "seabird5636809",
//     "seabird5636986",
//     "seabird5636379",
//     "seabird5636239",
//     "seabird5636652",
//     "seabird5636217",
//     "seabird5636816",
//     "seabird5636871",
//     "seabird5636876",
//     "seabird5636097",
//     "seabird5637039",
//     "seabird5635785",
//     "seabird5636499",
//     "seabird5636031",
//     "seabird5637114",
//     "seabird5637170",
//     "seabird5637238",
//     "seabird5637516",
//     "seabird5637620",
//     "seabird5637724",
//     "seabird5637687",
//     "seabird5637346",
//     "seabird5637835",
//     "seabird5637879",
//     "seabird5638127",
//     "seabird5638231",
//     "seabird5638254",
//     "seabird5638038",
//     "seabird5638047",
//     "seabird5638316",
//     "seabird5638178",
//     "seabird5638682",
//     "seabird5638842",
//     "seabird5639122",
//     "seabird5638839",
//     "seabird5639337",
//     "seabird5639310",
//     "seabird5639278",
//     "seabird5638429",
//     "seabird5638331",
//     "seabird5638361",
//     "seabird5638890",
//     "seabird5638643",
//     "seabird5639155",
//     "seabird5638940",
//     "seabird5639009",
//     "seabird5638499",
//     "seabird5638921",
//     "seabird5639012",
//     "seabird5638965",
//     "seabird5638584",
//     "seabird5639241",
//     "seabird5639227",
//     "seabird5639958",
//     "seabird5639648",
//     "seabird5639989",
//     "seabird5639669",
//     "seabird5640063",
//     "seabird5639712",
//     "seabird5639522",
//     "seabird5639913",
//     "seabird5639522",
//     "seabird5639902",
//     "seabird5640119",
//     "seabird5641810",
//     "seabird5641824",
//     "seabird5641797",
//     "seabird5640312",
//     "seabird5640163",
//     "seabird5640235",
//     "seabird5640281",
//     "seabird5640146",
//     "seabird5639989",
//     "seabird5640312",
//     "seabird5641741",
//     "seabird5641765",
//     "seabird5639806",
//     "seabird5639913",
//     "seabird5640146",
//     "seabird5640597",
//     "seabird5639958",
//     "seabird5640493",
//     "seabird5640235",
//     "seabird5640146",
//     "seabird5640312",
//     "seabird5640546",
//     "seabird5640613",
//     "seabird5640786",
//     "seabird5640493",
//     "seabird5640377",
//     "seabird5640899",
//     "seabird5640281",
//     "seabird5641327",
//     "seabird5640786",
//     "seabird5640119",
//     "seabird5640597",
//     "seabird5640493",
//     "seabird5640613",
//     "seabird5640597",
//     "seabird5640546",
//     "seabird5640899",
//     "seabird5641675",
//     "seabird5641579",
//     "seabird5641588",
//     "seabird5641693",
//     "seabird5641475",
//     "seabird5641642",
//     "seabird5641632",
//     "seabird5641475",
//     "seabird5641588",
//     "seabird5641642",
//     "seabird5639712",
//     "seabird5641579",
//     "seabird5641675",
//     "seabird5641741",
//     "seabird5641693",
//     "seabird5640281",
//     "seabird5641765",
//     "seabird5641881",
//     "seabird5639648",
//     "seabird5641797",
//     "seabird5641810",
//     "seabird5641887",
//     "seabird5641944",
//     "seabird5641927",
//     "seabird5641884",
//     "seabird5641974",
//     "seabird5641933",
//     "seabird5641960",
//     "seabird5642010",
//     "seabird5642001",
//     "seabird5641989",
//     "seabird5642030",
//     "seabird5642007",
//     "seabird5642253",
//     "seabird5641999",
//     "seabird5642128",
//     "seabird5642273",
//     "seabird5642117",
//     "seabird5642214",
//     "seabird5642268",
//     "seabird5642307",
//     "seabird5642097",
//     "seabird5642294",
//     "seabird5642346",
//     "seabird5642221",
//     "seabird5642020",
//     "seabird5642375",
//     "seabird5642047",
//     "seabird5642111",
//     "seabird5642029",
//     "seabird5642372",
//     "seabird5642068",
//     "seabird5642353",
//     "seabird5642121",
//     "seabird5642380",
//     "seabird5642366",
//     "seabird5642217",
//     "seabird5642361",
//     "seabird5642183",
//     "seabird5642318",
//     "seabird5642283",
//     "seabird5642264",
//     "seabird5642339",
//     "seabird5642196",
//     "seabird5642139",
//     "seabird5642210",
//     "seabird5642363",
//     "seabird5642498",
//     "seabird5642511",
//     "seabird5642441",
//     "seabird5642547",
//     "seabird5642411",
//     "seabird5642673",
//     "seabird5642659",
//     "seabird5642433",
//     "seabird5642557",
//     "seabird5642651",
//     "seabird5642386",
//     "seabird5642507",
//     "seabird5642568",
//     "seabird5642832",
//     "seabird5642796",
//     "seabird5642486",
//     "seabird5642426",
//     "seabird5642694",
//     "seabird5642601",
//     "seabird5642390",
//     "seabird5642532",
//     "seabird5642873",
//     "seabird5643068",
//     "seabird5642580",
//     "seabird5642492",
//     "seabird5642974",
//     "seabird5642574",
//     "seabird5642623",
//     "seabird5642700",
//     "seabird5642584",
//     "seabird5642520",
//     "seabird5642384",
//     "seabird5642603",
//     "seabird5642719",
//     "seabird5642676",
//     "seabird5642566",
//     "seabird5642534",
//     "seabird5642451",
//     "seabird5642551",
//     "seabird5642408",
//     "seabird5642592",
//     "seabird5642692",
//     "seabird5642457",
//     "seabird5642447",
//     "seabird5642644",
//     "seabird5642409",
//     "seabird5642685",
//     "seabird5642422",
//     "seabird5642756",
//     "seabird5642772",
//     "seabird5665545",
//     "seabird5665732",
//     "seabird5666248",
//     "seabird5666305",
//     "seabird5666192",
//     "seabird5666272",
//     "seabird5666613",
//     "seabird5666355",
//     "seabird5666656",
//     "seabird5665769",
//     "seabird5666028",
//     "seabird5665776",
//     "seabird5666444",
//     "seabird5666486",
//     "seabird5666214",
//     "seabird5666696",
//     "seabird5666976",
//     "seabird5666869",
//     "seabird5666754",
//     "seabird5667356",
//     "seabird5667079",
//     "seabird5666944",
//     "seabird5667014",
//     "seabird5667003",
//     "seabird5668186",
//     "seabird5668163",
//     "seabird5668273",
//     "seabird5668238",
//     "seabird5668297",
//     "seabird5668221",
//     "seabird5667620",
//     "seabird5667398",
//     "seabird5667561",
//     "seabird5667516",
//     "seabird5667586",
//     "seabird5667571",
//     "seabird5667475",
//     "seabird5667466",
//     "seabird5667381",
//     "seabird5667447",
//     "seabird5667574",
//     "seabird5667581",
//     "seabird5667745",
//     "seabird5667780",
//     "seabird5667692",
//     "seabird5667802",
//     "seabird5667629",
//     "seabird5667719",
//     "seabird5667776",
//     "seabird5667763",
//     "seabird5667702",
//     "seabird5668108",
//     "seabird5667973",
//     "seabird5668068",
//     "seabird5667966",
//     "seabird5668049",
//     "seabird5668099",
//     "seabird5668100",
//     "seabird5668088",
//     "seabird5667941",
//     "seabird5667949",
//     "seabird5667920",
//     "seabird5667889",
//     "seabird5667858",
//     "seabird5667826",
//     "seabird5666976",
//     "seabird5666754",
//     "seabird5666944",
//     "seabird5666696",
//     "seabird5667079",
//     "seabird5666869",
//     "seabird5667003",
//     "seabird5667014",
//     "seabird5667356",
//     "seabird5667381",
//     "seabird5667475",
//     "seabird5667447",
//     "seabird5667398",
//     "seabird5667466",
//     "seabird5667586",
//     "seabird5667581",
//     "seabird5667629",
//     "seabird5667516",
//     "seabird5667620",
//     "seabird5667571",
//     "seabird5667561",
//     "seabird5667702",
//     "seabird5667574",
//     "seabird5667763",
//     "seabird5667692",
//     "seabird5667780",
//     "seabird5667745",
//     "seabird5667719",
//     "seabird5667920",
//     "seabird5667858",
//     "seabird5667776",
//     "seabird5667802",
//     "seabird5667941",
//     "seabird5667826",
//     "seabird5667966",
//     "seabird5667973",
//     "seabird5667949",
//     "seabird5667889",
//     "seabird5668108",
//     "seabird5668088",
//     "seabird5668068",
//     "seabird5668099",
//     "seabird5668100",
//     "seabird5668049",
//     "seabird5668163",
//     "seabird5668186",
//     "seabird5668221",
//     "seabird5668273",
//     "seabird5668238",
//     "seabird5668297",
//     "seabird5668418",
//     "seabird5668525",
//     "seabird5668385",
//     "seabird5668455",
//     "seabird5668400",
//     "seabird5668477",
//     "seabird5668325",
//     "seabird5668430",
//     "seabird5668485",
//     "seabird5668325",
//     "seabird5668485",
//     "seabird5668477",
//     "seabird5668619",
//     "seabird5668430",
//     "seabird5668763",
//     "seabird5668400",
//     "seabird5668802",
//     "seabird5668719",
//     "seabird5668756",
//     "seabird5668819",
//     "seabird5668705",
//     "seabird5668756",
//     "seabird5668769",
//     "seabird5668786",
//     "seabird5668719",
//     "seabird5668769",
//     "seabird5668619",
//     "seabird5668739",
//     "seabird5668819",
//     "seabird5668659",
//     "seabird5668786",
//     "seabird5668739",
//     "seabird5668455",
//     "seabird5668799",
//     "seabird5668969",
//     "seabird5668705",
//     "seabird5669191",
//     "seabird5669277",
//     "seabird5669752",
//     "seabird5668932",
//     "seabird5669277",
//     "seabird5669752",
//     "seabird5668932",
//     "seabird5668969",
//     "seabird5669191",
//     "seabird5668797",
//     "seabird5668654",
//     "seabird5668841",
//     "seabird5671013",
//     "seabird5670988",
//     "seabird5670925",
//     "seabird5671001",
//     "seabird5671013",
//     "seabird5670925",
//     "seabird5670988",
//     "seabird5671001",
//     "seabird5674252",
//     "seabird5674217",
//     "seabird5674032",
//     "seabird5674483",
//     "seabird5674100",
//     "seabird5674310",
//     "seabird5674406",
//     "seabird5673960",
//     "seabird5674087",
//     "seabird5674059",
//     "seabird5673928",
//     "seabird5673917",
//     "seabird5673612",
//     "seabird5673593",
//     "seabird5673612",
//     "seabird5673593",
//     "seabird5673917",
//     "seabird5673928",
//     "seabird5674694",
//     "seabird5674519",
//     "seabird5674922",
//     "seabird5675831",
//     "seabird5675722",
//     "seabird5675767",
//     "seabird5675237",
//     "seabird5675312",
//     "seabird5675099",
//     "seabird5675275",
//     "seabird5675355",
//     "seabird5675378",
//     "seabird5675131",
//     "seabird5675508",
//     "seabird5675180",
//     "seabird5675334",
//     "seabird5630735"
// ]
const transactionMutex = new Mutex();
const logsMutex = new Mutex();
const loopMutex = new Mutex();


// function scheduleWayuPayOutCheck() {
//     cron.schedule('*/30 * * * *', async () => {
//         const release = await transactionMutex.acquire();
//         try {
//             let GetData = await payOutModelGenerate.find({ isSuccess: "Pending" }).limit(500);
//             if (GetData.length !== 0) {
//                 GetData.forEach(async (item) => {
//                     let uatUrl = "https://api.waayupay.com/api/api/api-module/payout/status-check"
//                     let postAdd = {
//                         clientId: "adb25735-69c7-4411-a120-5f2e818bdae5",
//                         secretKey: "6af59e5a-7f28-4670-99ae-826232b467be",
//                         clientOrderId: item.trxId
//                     }
//                     let header = {
//                         header: {
//                             "Accept": "application/json",
//                             "Content-Type": "application/json"
//                         }
//                     }

//                     await axios.post(uatUrl, postAdd, header).then(async (data) => {
//                         if (data?.data?.status !== 1) {
//                             await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Failed" })
//                         }

//                         else if (data?.data?.status === 1) {
//                             let userWalletInfo = await userDB.findById(item?.memberId, "_id EwalletBalance");
//                             let beforeAmountUser = userWalletInfo.EwalletBalance;
//                             let finalEwalletDeducted = item?.afterChargeAmount;
//                             await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Success" })

//                             let walletModelDataStore = {
//                                 memberId: userWalletInfo._id,
//                                 transactionType: "Dr.",
//                                 transactionAmount: item?.amount,
//                                 beforeAmount: beforeAmountUser,
//                                 chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
//                                 afterAmount: beforeAmountUser - finalEwalletDeducted,
//                                 description: `Successfully Dr. amount: ${finalEwalletDeducted}`,
//                                 transactionStatus: "Success",
//                             }

//                             // update the user wallet balance 
//                             userWalletInfo.EwalletBalance -= finalEwalletDeducted
//                             await userWalletInfo.save();

//                             let storeTrx = await walletModel.create(walletModelDataStore)

//                             let payoutDataStore = {
//                                 memberId: item?.memberId,
//                                 amount: item?.amount,
//                                 chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
//                                 finalAmount: finalEwalletDeducted,
//                                 bankRRN: data?.data?.utr,
//                                 trxId: data?.data?.clientOrderId,
//                                 optxId: data?.data?.orderId,
//                                 isSuccess: "Success"
//                             }

//                             await payOutModel.create(payoutDataStore)
//                         }

//                     }).catch((err) => {
//                         console.log(err.message)
//                     })
//                 })
//             }
//         } catch (error) {
//             console.log(error)
//         } finally {
//             release()
//         }
//     });
// }

function scheduleWayuPayOutCheck() {
    cron.schedule('*/10 * * * *', async () => {
        let GetData = await payOutModelGenerate.find({ isSuccess: "Pending" }).sort({ "createdAt": 1 }).limit(20);
        try {
            GetData.forEach(async (item) => {
                await processWaayuPayOutFn(item)
            });
        } catch (error) {
            console.error('Error during payout check:', error.message);
        }
    });
}

async function processWaayuPayOutFn(item) {
    const uatUrl = "https://api.waayupay.com/api/api/api-module/payout/status-check";
    const postAdd = {
        clientId: "adb25735-69c7-4411-a120-5f2e818bdae5",
        secretKey: "6af59e5a-7f28-4670-99ae-826232b467be",
        clientOrderId: item?.trxId,
    };
    const header = {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    };

    const { data } = await axios.post(uatUrl, postAdd, header);
    const session = await userDB.startSession({ readPreference: 'primary', readConcern: { level: "majority" }, writeConcern: { w: "majority" } });
    const release = await transactionMutex.acquire();
    try {
        session.startTransaction();
        const opts = { session };

        console.log(data)

        if (data?.status === null) {
            await session.abortTransaction();
            return false
        }

        // Non-transactional operation can be done outside the critical section
        if (data?.status !== 1) {
            console.log("failed added Status");
            await payOutModelGenerate.findByIdAndUpdate(item._id, { isSuccess: "Failed" }, opts);
            // Use Promise.all for parallel execution of independent tasks
            const userWalletInfo = await userDB.findById(item?.memberId, "_id EwalletBalance", opts)

            const beforeAmountUser = userWalletInfo?.EwalletBalance;
            const finalEwalletDeducted = item?.afterChargeAmount;

            userWalletInfo.EwalletBalance += finalEwalletDeducted;
            await userWalletInfo.save(opts);

            const walletModelDataStore = {
                memberId: userWalletInfo._id,
                transactionType: "Cr.",
                transactionAmount: item?.amount,
                beforeAmount: beforeAmountUser,
                chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
                afterAmount: beforeAmountUser + finalEwalletDeducted,
                description: `Successfully Cr. amount: ${finalEwalletDeducted} with :${item?.trxId}`,
                transactionStatus: "Success",
            };

            await walletModel.create([walletModelDataStore], opts)
            await session.commitTransaction();
            return true;

        }

        else if (data?.status === 1) {
            // Final update and commit in transaction
            let payoutModelData = await payOutModelGenerate.findByIdAndUpdate(item?._id, { isSuccess: "Success" }, { session, new: true });
            console.log(payoutModelData)
            let finalEwalletDeducted = payoutModelData?.afterChargeAmount

            let PayoutStoreData = {
                memberId: item?.memberId,
                amount: item?.amount,
                chargeAmount: item?.gatwayCharge || item?.afterChargeAmount - item?.amount,
                finalAmount: finalEwalletDeducted,
                bankRRN: data?.utr,
                trxId: data?.clientOrderId,
                optxId: data?.orderId,
                isSuccess: "Success",
            }

            let v = await payOutModel.create([PayoutStoreData], opts)
            console.log(v, "hello")
            await session.commitTransaction();
            return true;
        }
        else {
            console.log("Failed and Success Not Both !");
            await session.abortTransaction();
            return true;
        }
        // Commit transaction
        // await session.commitTransaction();
        // return true;

    } catch (error) {
        console.log("inside the error", error)
        await session.abortTransaction();
        return false
    } finally {
        session.endSession();
        release()
    }
}

function scheduleBeforeAmountUpdate() {
    cron.schedule('*/10 * * * * *', async () => {
        try {
            let GetData = await payOutModelGenerate.find({
                isSuccess: "Pending",
                createdAt: { $gt: new Date("2025-01-02T16:30:56.403+05:30") },
                memberId: new mongoose.Types.ObjectId("676691bfc10ccd627297eb94")
            }).sort({ createdAt: 1 }).limit(1);
            GetData.forEach(async (item) => {
                await beforeAmountUpdate(item)
            });
            console.log("getDataaaaaaa", GetData);


        } catch (error) {
            console.error('Error during payout check:', error.message);
        }
    });
}

async function beforeAmountUpdate(item) {
    const uatUrl = "https://api.waayupay.com/api/api/api-module/payout/status-check";
    const postAdd = {
        clientId: "adb25735-69c7-4411-a120-5f2e818bdae5",
        secretKey: "6af59e5a-7f28-4670-99ae-826232b467be",
        clientOrderId: item?.trxId,
    };
    const header = {
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
        },
    };

    // const session = await userDB.startSession({
    //     readPreference: 'primary',
    //     readConcern: { level: "majority" },
    //     writeConcern: { w: "majority" }
    // });
    const release = await transactionMutex.acquire();

    try {
        // await session.startTransaction();
        const { data } = await axios.post(uatUrl, postAdd, header);
        // const opts = { session };

        // console.log(data);

        if (!data?.status) {
            // await session.abortTransaction();
            console.log("status not available", data);
            
            return false;
        }

        const user = await userDB.findById(item?.memberId);
        // const user = await userDB.findById(item?.memberId, null, opts);
        // const payOutModelGen = await payOutModelGenerate.findOne({ trxId: item?.trxId }, opts);
        const payOutModelGen = await payOutModelGenerate.findOne({ trxId: item?.trxId });
        console.log("payoutModelgenedd", payOutModelGen);

        const { gatwayCharge, amount } = payOutModelGen;
        const chargeAmount = gatwayCharge
        const finalAmountDeduct = amount + chargeAmount;

        user.EwalletBalance -= finalAmountDeduct;
        const updatedUser = await userDB.findOneAndUpdate(
            { _id: user._id, EwalletBalance: { $gte: finalAmountDeduct } },
            { $inc: { EwalletBalance: -finalAmountDeduct } },
            { new: true }
            // { ...opts, new: true }
        );

        const walletDoc = await walletModel.findOneAndUpdate(
            { description: { $regex: item?.trxId, $options: 'i' } },
            {
                beforeAmount: Number(user.EwalletBalance),
                afterAmount: Number(user.EwalletBalance) - Number(finalAmountDeduct)
            },
            { new: true }
        );

        if (data.status == 1) {
            payOutModelGen.isSuccess = "Success";
            await payOutModelGen.save();
            // await session.commitTransaction();
            return true;
        } else {
            user.EwalletBalance += finalAmountDeduct;
            await user.save();

            const walletDocUpd = await walletModel.findOneAndUpdate(
                { description: { $regex: item?.trxId, $options: 'i' } },
                {
                    beforeAmount: Number(user.EwalletBalance) - Number(finalAmountDeduct),
                    afterAmount: Number(user.EwalletBalance)
                },
                { ...opts, new: true }
            );
            console.log("walletDoc>>>", walletDocUpd);

            payOutModelGen.isSuccess = "Failed";
            await payOutModelGen.save();
        }
    } catch (error) {
        console.log("inside the error", error);
        // await session.abortTransaction();
        return false;
    } finally {
        // await session.endSession();
        release();
    }
}

function migrateData() {
    cron.schedule('0,30 * * * *', async () => {
        const release = await transactionMutex.acquire();
        try {
            console.log("Running cron job to migrate old data...");

            const threeHoursAgo = new Date();
            threeHoursAgo.setHours(threeHoursAgo.getHours() - 3)

            const oldData = await qrGenerationModel.find({ createdAt: { $lt: threeHoursAgo } }).sort({ createdAt: 1 }).limit(5000);

            if (oldData.length > 0) {
                const newData = oldData.map(item => ({
                    ...item,
                    memberId: new mongoose.Types.ObjectId((String(item?.memberId))),
                    name: String(item?.name),
                    amount: Number(item?.amount),
                    trxId: String(item?.trxId),
                    migratedAt: new Date(),
                }));

                await oldQrGenerationModel.insertMany(newData);

                const oldDataIds = oldData.map(item => item._id);
                await qrGenerationModel.deleteMany({ _id: { $in: oldDataIds } });

                console.log(`Successfully migrated ${oldData.length} records.`);
            } else {
                console.log("No data older than 1 day to migrate.");
            }
        } catch (error) {
            console.log("error=>", error.message);
        } finally {
            release()
        }
    }
    )
}

function logsClearFunc() {
    cron.schedule('* * */7 * *', async () => {
        let date = new Date();
        let DateComp = `${date.getFullYear()}-${(date.getMonth()) + 1}-${date.getDate() - 2}`
        await LogModel.deleteMany({ createdAt: { $lt: new Date(DateComp) } });
    });
}

// function payinScheduleTask() {
//     cron.schedule('*/10 * * * * *', async () => {
//         const release = await logsMutex.acquire()
//         try {
//             const logsToUpdate = await Log.aggregate([
//                 {
//                     $match: {
//                         "requestBody.status": 200,
//                         "responseBody": { $regex: "\"message\":\"Failed\"", $options: "i" }
//                     }
//                 },
//                 { $limit: 100 }
//             ]);

//             for (const log of logsToUpdate) {
//                 const trxId = log.requestBody.trxId;
//                 if (!trxId) continue;

//                 // Find QR Generation documents and update their callback status
//                 const qrDoc = await qrGenerationModel.findOneAndUpdate(
//                     { trxId, callBackStatus: "Pending" },
//                     { callBackStatus: "Success" }
//                 );

//                 if (!qrDoc) continue;

//                 // Prepare callback data from Log's requestBody
//                 let callBackData = log.requestBody;

//                 if (Object.keys(callBackData).length === 1) {
//                     const key = Object.keys(callBackData)[0];
//                     callBackData = JSON.parse(key);
//                 }

//                 const switchApi = callBackData.partnerTxnId
//                     ? "neyopayPayIn"
//                     : callBackData.txnID
//                         ? "marwarpayInSwitch"
//                         : null;

//                 if (!switchApi) continue;

//                 const data =
//                     switchApi === "neyopayPayIn"
//                         ? {
//                             status: callBackData?.txnstatus === "Success" ? 200 : 400,
//                             payerAmount: callBackData?.amount,
//                             payerName: callBackData?.payerName,
//                             txnID: callBackData?.partnerTxnId,
//                             BankRRN: callBackData?.rrn,
//                             payerVA: callBackData?.payerVA,
//                             TxnInitDate: callBackData?.TxnInitDate,
//                             TxnCompletionDate: callBackData?.TxnCompletionDate,
//                         }
//                         : {
//                             status: callBackData?.status,
//                             payerAmount: callBackData?.payerAmount,
//                             payerName: callBackData?.payerName,
//                             txnID: callBackData?.txnID,
//                             BankRRN: callBackData?.BankRRN,
//                             payerVA: callBackData?.payerVA,
//                             TxnInitDate: callBackData?.TxnInitDate,
//                             TxnCompletionDate: callBackData?.TxnCompletionDate,
//                         };

//                 if (data.status !== 200) continue;

//                 const userInfoPromise = userDB.aggregate([
//                     { $match: { _id: qrDoc.memberId } },
//                     { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } },
//                     { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
//                     { $lookup: { from: "payinpackages", localField: "package.packagePayInCharge", foreignField: "_id", as: "packageCharge" } },
//                     { $unwind: { path: "$packageCharge", preserveNullAndEmptyArrays: true } },
//                     { $project: { _id: 1, userName: 1, upiWalletBalance: 1, packageCharge: 1 } },
//                 ]);

//                 const callBackPayinUrlPromise = callBackResponseModel
//                     .find({ memberId: qrDoc.memberId, isActive: true })
//                     .select("_id payInCallBackUrl isActive");

//                 const [userInfoResult, callBackPayinUrlResult] = await Promise.allSettled([
//                     userInfoPromise,
//                     callBackPayinUrlPromise,
//                 ]);

//                 const userInfo = userInfoResult.value?.[0];
//                 const callBackPayinUrl = callBackPayinUrlResult.value?.[0]?.payInCallBackUrl;

//                 if (!userInfo || !callBackPayinUrl) continue;

//                 const chargeRange = userInfo.packageCharge?.payInChargeRange || [];
//                 const charge = chargeRange.find(
//                     (range) => range.lowerLimit <= data.payerAmount && range.upperLimit > data.payerAmount
//                 );

//                 const userChargeApply =
//                     charge.chargeType === "Flat"
//                         ? charge.charge
//                         : (charge.charge / 100) * data.payerAmount;
//                 const finalAmountAdd = data.payerAmount - userChargeApply;

//                 const [upiWalletUpdateResult, payInCreateResult] = await Promise.allSettled([
//                     userDB.findByIdAndUpdate(userInfo._id, {
//                         upiWalletBalance: userInfo.upiWalletBalance + finalAmountAdd,
//                     }),
//                     payInModel.create({
//                         memberId: qrDoc.memberId,
//                         payerName: data.payerName,
//                         trxId: data.txnID,
//                         amount: data.payerAmount,
//                         chargeAmount: userChargeApply,
//                         finalAmount: finalAmountAdd,
//                         vpaId: data.payerVA,
//                         bankRRN: data.BankRRN,
//                         description: `QR Generated Successfully Amount:${data.payerAmount} PayerVa:${data.payerVA} BankRRN:${data.BankRRN}`,
//                         trxCompletionDate: data.TxnCompletionDate,
//                         trxInItDate: data.TxnInitDate,
//                         isSuccess: data.status === 200 ? "Success" : "Failed",
//                     }),
//                 ]);

//                 if (
//                     upiWalletUpdateResult.status === "rejected" ||
//                     payInCreateResult.status === "rejected"
//                 ) {
//                     console.error("Error updating wallet or creating pay-in record");
//                     continue;
//                 }

//                 const userRespSendApi = {
//                     status: data.status,
//                     payerAmount: data.payerAmount,
//                     payerName: data.payerName,
//                     txnID: data.txnID,
//                     BankRRN: data.BankRRN,
//                     payerVA: data.payerVA,
//                     TxnInitDate: data.TxnInitDate,
//                     TxnCompletionDate: data.TxnCompletionDate,
//                 };

//                 await axios.post(callBackPayinUrl, userRespSendApi, {
//                     headers: {
//                         Accept: "application/json",
//                         "Content-Type": "application/json",
//                     },
//                 });
//             }
//         } catch (error) {

//         } finally {
//             release()
//         }
//     });
// }

function payinScheduleTask() {
    cron.schedule('0,30 * * * *', async () => {
        const release = await logsMutex.acquire()
        try {
            const startOfYesterday = moment().startOf('day').subtract(1, 'day').toDate();
            const endOfYesterday = moment().startOf('day').subtract(1, 'milliseconds').toDate();
            const endOfLastHalfHour = moment().toDate(); // Current time
            const startOfLastHalfHour = moment().subtract(30, 'minutes').toDate();
            const logs = await Log.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfYesterday,
                            $lte: endOfYesterday,
                            // $gte: startOfLastHalfHour,
                            // $lte: endOfLastHalfHour,
                        },

                        "requestBody.status": 200,
                        // "requestBody.txnID": { $regex: "seabird74280342", $options: "i" },
                        // "requestBody.txnID": {
                        //     $in: [
                        //         "seabird74592153", "seabird74592045", "seabird74592191",
                        //         "seabird74592244"
                        //     ],
                        // },
                        "responseBody": { $regex: "\"message\":\"Failed\"", $options: "i" },
                        url: { $regex: "/apiAdmin/v1/payin/callBackResponse", $options: "i" },
                        description: { $nin: ["Log processed for payin and marked success"] }
                    },
                },
                { $sort: { createdAt: -1 } },
                { $limit: 10 }
            ]);

            if (!logs.length) return;

            for (const log of logs) {
                const loopRelease = await loopMutex.acquire()
                try {
                    const trxId = log.requestBody.txnID;
                    if (!trxId) throw new Error("Missing trxId in log");
                    let qrDoc
                    qrDoc = await qrGenerationModel.findOneAndUpdate(
                        { trxId },
                        // { trxId, callBackStatus: "Pending" },
                        { callBackStatus: "Success" }
                    )

                    if (!qrDoc) {
                        qrDoc = await oldQrGenerationModel.findOneAndUpdate(
                            { trxId },
                            // { trxId, callBackStatus: "Pending" },
                            { callBackStatus: "Success" }
                        );
                    }
                    console.log("qrDoc>>", qrDoc);

                    if (!qrDoc) throw new Error("QR Generation document not found or already processed");

                    let callBackData = log.requestBody;
                    if (Object.keys(callBackData).length === 1) {
                        const key = Object.keys(callBackData)[0];
                        callBackData = JSON.parse(key);
                    }

                    const switchApi = callBackData.partnerTxnId
                        ? "neyopayPayIn"
                        : callBackData.txnID
                            ? "marwarpayInSwitch"
                            : null;

                    if (!switchApi) throw new Error("Invalid transaction data in log");

                    const data = switchApi === "neyopayPayIn"
                        ? {
                            status: callBackData?.txnstatus === "Success" ? 200 : 400,
                            payerAmount: callBackData?.amount,
                            payerName: callBackData?.payerName,
                            txnID: callBackData?.partnerTxnId,
                            BankRRN: callBackData?.rrn,
                            payerVA: callBackData?.payerVA,
                            TxnInitDate: callBackData?.TxnInitDate,
                            TxnCompletionDate: callBackData?.TxnCompletionDate,
                        }
                        : {
                            status: callBackData?.status,
                            payerAmount: callBackData?.payerAmount,
                            payerName: callBackData?.payerName,
                            txnID: callBackData?.txnID,
                            BankRRN: callBackData?.BankRRN,
                            payerVA: callBackData?.payerVA,
                            TxnInitDate: callBackData?.TxnInitDate,
                            TxnCompletionDate: callBackData?.TxnCompletionDate,
                        };

                    if (data.status !== 200) throw new Error("Transaction is pending or not successful");

                    const [userInfo] = await userDB.aggregate([
                        { $match: { _id: qrDoc.memberId } },
                        { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } },
                        { $unwind: { path: "$package", preserveNullAndEmptyArrays: true } },
                        { $lookup: { from: "payinpackages", localField: "package.packagePayInCharge", foreignField: "_id", as: "packageCharge" } },
                        { $unwind: { path: "$packageCharge", preserveNullAndEmptyArrays: true } },
                        { $project: { _id: 1, userName: 1, upiWalletBalance: 1, packageCharge: 1 } },
                    ])
                    const callBackPayinUrl = await callBackResponseModel.findOne({ memberId: qrDoc.memberId, isActive: true }).select("payInCallBackUrl")


                    if (!callBackPayinUrl) throw new Error("Callback URL is missing");


                    if (!userInfo) throw new Error("User info missing");

                    const chargeRange = userInfo.packageCharge?.payInChargeRange || [];
                    const charge = chargeRange.find(
                        (range) => range.lowerLimit <= data.payerAmount && range.upperLimit > data.payerAmount
                    );

                    if (!charge) return;

                    const userChargeApply =
                        charge.chargeType === "Flat"
                            ? charge.charge
                            : (charge.charge / 100) * data.payerAmount;
                    const finalAmountAdd = data.payerAmount - userChargeApply;

                    const tempPayin = await payInModel.findOne({ trxId: qrDoc?.trxId })

                    if (tempPayin) {
                        await Log.findByIdAndUpdate(log._id, {
                            $push: { description: "Log processed for payin and marked success" },
                        });
                        throw new Error("Trasaction already created");
                    }
                    const upiWalletDataObject = {
                        memberId: userInfo?._id,
                        transactionType: "Cr.",
                        transactionAmount: finalAmountAdd,
                        beforeAmount: userInfo?.upiWalletBalance,
                        afterAmount: Number(userInfo?.upiWalletBalance) + Number(finalAmountAdd),
                        description: `Successfully Cr. amount: ${finalAmountAdd}  trxId: ${data.txnID}`,
                        transactionStatus: "Success"
                    }

                    await upiWalletModel.create(upiWalletDataObject);
                    const upiWalletUpdateResult = await userDB.findByIdAndUpdate(userInfo._id, {
                        $inc: { upiWalletBalance: finalAmountAdd },
                    })

                    const payInCreateResult = await payInModel.create({
                        memberId: qrDoc.memberId,
                        payerName: data.payerName,
                        trxId: data.txnID,
                        amount: data.payerAmount,
                        chargeAmount: userChargeApply,
                        finalAmount: finalAmountAdd,
                        vpaId: data.payerVA,
                        bankRRN: data.BankRRN,
                        description: `QR Generated Successfully Amount:${data.payerAmount} PayerVa:${data.payerVA} BankRRN:${data.BankRRN}`,
                        trxCompletionDate: data.TxnCompletionDate,
                        trxInItDate: data.TxnInitDate,
                        isSuccess: "Success",
                    })

                    if (!upiWalletUpdateResult || !payInCreateResult) {
                        throw new Error("Error updating wallet or creating pay-in record");
                    }

                    const userRespSendApi = {
                        status: data.status,
                        payerAmount: data.payerAmount,
                        payerName: data.payerName,
                        txnID: data.txnID,
                        BankRRN: data.BankRRN,
                        payerVA: data.payerVA,
                        TxnInitDate: data.TxnInitDate,
                        TxnCompletionDate: data.TxnCompletionDate,
                    };
                    console.log("callBackPayinUrl.payInCallBackUrl>>>", callBackPayinUrl.payInCallBackUrl, userRespSendApi);



                    await axios.post(callBackPayinUrl.payInCallBackUrl, userRespSendApi, {
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                    });

                    await Log.findByIdAndUpdate(log._id, {
                        $push: { description: "Log processed for payin and marked success" },
                    });

                } catch (error) {
                    console.error(`Error processing log with trxId ${log.requestBody.txnID}:`, error.message);
                } finally {
                    loopRelease()
                }
            }

        } catch (error) {
            console.log("Error in payin schedule task:", error.message);
        } finally {
            release()
        }
    });
}

function payoutDeductDoubleTaskScript() {
    cron.schedule('*/10 * * * * *', async () => {
        console.log('Cron job started:', new Date(),);

        try {
            const startOfLastDay = moment().subtract(1, 'day').startOf('day').toDate();
            const endOfLastDay = moment().subtract(1, 'day').endOf('day').toDate();

            const logs = await Log.aggregate([
                {
                    $match: {
                        createdAt: {
                            $gte: startOfLastDay,
                            $lte: new Date()
                        },
                        responseBody: { $regex: '"status":1', $options: 'i' }
                    }
                },
                {
                    $project: {
                        trxId: '$requestBody.trxId'
                    }
                }
            ]);

            if (!logs.length) {
                console.log('No matching logs found for the last day.');
                return;
            }

            const trxIds = logs.map(log => log.trxId);

            const regexPatterns = trxIds.map(trxId => new RegExp(trxId, 'i'));

            let updatedArrayOfEwallet = [];

            for (const txnId of trxIds) {
                const [updateResult] = await EwalletModel.find(
                    {
                        description: { $regex: txnId, $options: "i" },
                        transactionType: { $regex: 'Cr.', $options: "i" },
                    }
                );

                if (updateResult) {
                    try {
                        updatedArrayOfEwallet.push(updateResult)
                        const { transactionAmount, chargeAmount, memberId } = updateResult
                        const user = await userDB.findById(memberId)
                        const finalAmountDeduct = 2 * (Number(transactionAmount) + Number(chargeAmount))
                        user.EwalletBalance -= finalAmountDeduct;
                        await user.save()
                        const ewalletDoc = await EwalletModel.create({
                            memberId,
                            transactionType: "Dr.",
                            transactionAmount: transactionAmount,
                            beforeAmount: user.EwalletBalance,
                            chargeAmount: chargeAmount,
                            afterAmount: Number(user.EwalletBalance) - Number(finalAmountDeduct),
                            description: `Successfully Dr. amount: ${finalAmountDeduct} with transaction Id: ${txnId}`,
                            transactionStatus: "Success",
                        })

                        if (ewalletDoc) await updateResult.deleteOne({ _id: updateResult?._id })
                    } catch (error) {
                        console.log("error.message>>>", error.message);
                        break
                    }

                }
            }


            console.log(`Total modified documents in eWallets: ${updatedArrayOfEwallet.length}`);
        } catch (error) {
            console.error('Error in cron job:', error.message);
        } finally {
            console.log('Cron job completed:', new Date());
        }
    });
}
var scriptRan = false
function payoutDeductPackageTaskScript() {
    cron.schedule('*/10 * * * * *', async () => {
        console.log('Cron job started:', new Date());
        if (scriptRan) return
        scriptRan = true

        try {

            for (const txnId of matchedTrxIds) {
                const [updateResult] = await EwalletModel.find(
                    {
                        description: { $regex: txnId, $options: "i" },
                    }
                );

                const payoutRecord = await payOutModel.findOne({ trxId: txnId })
                if (updateResult && payoutRecord) {
                    try {
                        const [user] = await userDB.aggregate([
                            {
                                $match: {
                                    // $and: [{ userName }, { trxAuthToken: authToken }, { isActive: true }]
                                    _id: payoutRecord.memberId
                                }
                            },
                            { $lookup: { from: "payoutswitches", localField: "payOutApi", foreignField: "_id", as: "payOutApi" } },
                            { $unwind: "$payOutApi" },
                            { $lookup: { from: "packages", localField: "package", foreignField: "_id", as: "package" } },
                            { $unwind: "$package" },
                            { $lookup: { from: "payoutpackages", localField: "package.packagePayOutCharge", foreignField: "_id", as: "packageCharge" } },
                            { $unwind: "$packageCharge" },
                            { $project: { "userName": 1, "memberId": 1, "EwalletBalance": 1, "minWalletBalance": 1, "payOutApi": 1, "packageCharge": 1 } }
                        ]);
                        if (updateResult.transactionType != "Dr.") return
                        //Addition before deduction the real charge + amount
                        let finalAmountAdd = payoutRecord.chargeAmount + payoutRecord.amount
                        user.EwalletBalance += finalAmountAdd;
                        console.log("finalamountAdd>>>>", finalAmountAdd);

                        await userDB.updateOne({ _id: user._id }, { $set: { EwalletBalance: user.EwalletBalance } });

                        if (!user) {
                            return console.log({ message: "Failed", data: "Invalid Credentials or User Inactive!" });
                        }

                        const { payOutApi, packageCharge, EwalletBalance, minWalletBalance } = user;
                        const amount = payoutRecord.amount

                        if (payOutApi.apiName === "ServerMaintenance") {
                            return console.log({ message: "Failed", data: { status_msg: "Server Under Maintenance!", status: 400, trxID: txnId } });
                        }

                        const chargeDetails = packageCharge.payOutChargeRange.find(value => value.lowerLimit <= amount && value.upperLimit > amount);
                        if (!chargeDetails) {
                            return console.log({ message: "Failed", data: "Invalid package!" });
                        }

                        const chargeAmount = chargeDetails.chargeType === "Flat" ? chargeDetails.charge : (chargeDetails.charge / 100) * amount;
                        const finalAmountDeduct = amount + chargeAmount;
                        const usableBalance = EwalletBalance - minWalletBalance;

                        const payoutGen = await payOutModelGenerate.findOneAndUpdate(
                            { trxId: txnId },
                            { afterChargeAmount: finalAmountDeduct, gatwayCharge: chargeAmount },
                            { new: true, strict: true }
                        )

                        user.EwalletBalance -= finalAmountDeduct;
                        await userDB.updateOne({ _id: user._id }, { $set: { EwalletBalance: user.EwalletBalance } });

                        payoutRecord.chargeAmount = chargeAmount
                        payoutRecord.finalAmount = finalAmountDeduct
                        await payoutRecord.save()

                        updateResult.chargeAmount = chargeAmount
                        updateResult.afterAmount = Number(user.EwalletBalance) - Number(finalAmountDeduct)

                        await updateResult.save()
                        console.log("script ran for trxId:", txnId);
                    } catch (error) {
                        console.log("error.message>>>", error.message);
                        break
                    }

                }
            }
        } catch (error) {
            console.error('Error in cron job:', error.message);
        } finally {
            console.log('Cron job completed:', new Date());
        }
    });
}

export default function scheduleTask() {
    scheduleWayuPayOutCheck()
    logsClearFunc()
    // migrateData()
    // payinScheduleTask()
    // payoutTaskScript()
    // payoutDeductPackageTaskScript()
    // scheduleBeforeAmountUpdate()
}