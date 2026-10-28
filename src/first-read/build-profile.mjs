// SPDX-License-Identifier: Apache-2.0
// Owned closed compilation acquisition. The manifest binds exact inputs/options
// to actual output bytes; it does not supply the missing alias/effect proof.
import {open,lstat,realpath} from 'node:fs/promises';
import {constants,lstatSync} from 'node:fs';
import {createRequire,builtinModules} from 'node:module';
import {Script} from 'node:vm';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {instrumentScript} from "../engine/script-transform.mjs";import {transformReactVendor,vendorHashes} from "../engine/react-host-vendor.mjs";import {transformQueryVendor} from "../engine/query-vendor.mjs";
import {transformFirstQuery,firstQueryHashes} from './query-contracts.mjs';import {instrumentReadReceipts} from './observer-receipts.mjs';import {instrumentReadRegion} from './source-region.mjs';
const defaultRoot=process.cwd(),sha=v=>createHash('sha256').update(v).digest('hex');
const SOURCE_LIMIT=2*1024*1024;
// Observed local esbuild 0.25.12 npm artifacts. Other platforms are deliberately
// unsupported until their exact native artifacts have independent reviewed pins.
const API_PIN='0d1241812c443111d39475dfc66836003e9ef8b87e54d990dd67df29d20010e1';
const BINARY_PIN='bab29b2ca7a9e89b67cf720b77b2d743f9f31f5cf0d5bd74ee8c8de30ced7014';
const BUILDER_PIN = '229102bf3120b459d12ca8f0243b30c79db1b56c735400b980b1bcc33f4c1cd7';
const RECIPE_PINS={
  "src/engine/action-transform.mjs": "ff7eb4f075a58ea37b9fee45f3c40953263c31210e4976ced69868588557511b",
  "src/engine/script-transform.mjs": "80ead8568bcc85cbb6312d407fa43ff76c20bdff7b683b6aab15a8ab2c074957",
  "src/engine/plugin.mjs": "88553700110f94202970c57a115fd04a9bc29d43015fb09a91056029a1b16fb1",
  "src/engine/react-host-vendor.mjs": "a350aa4d271d034a8e458947291b9c4e705621ce63ebcd44e93c9bc25aae1361",
  "src/engine/query-vendor.mjs": "628af6f60568f5eb0d16101ff4db4ef71ce79263746336a7298f121abb286061",
  "src/engine/write-access.mjs": "07e6e811213b29aada895572caf1f415805f7157574bc09e76b84656ec278b06",
  "src/first-read/react-contracts.mjs": "529b15b907504260d6f420685e6bc84cc4edbd121375c2f19dff2252205b4161",
  "src/first-read/query-contracts.mjs": "1f88237975eacca9dd4e87309c9849499bd3ffa09a4b6ffa6f80ca48a3fc4b22",
  "src/first-read/observer-receipts.mjs": "6e6c2267eb2a3b519fd4c9e31efbbcfbba780daf91f618523841a2d61b0e9e36",
  "src/first-read/source-region.mjs": "0e07ecbc1f945ef0abdea3d3607b01a7d436086607d8e8fc476513bcd29f2a35"
};
const TOOL_PINS={
  "node_modules/@babel/code-frame/lib/index.js": "313711c78293dfc83beb2ce5d6846a539235fc48fdd507361b59db8aaba2b186",
  "node_modules/@babel/code-frame/package.json": "f9cccb2e601db93851f10935b4e723c95a730c467f187462eb54b16bb353b036",
  "node_modules/@babel/compat-data/data/native-modules.json": "1b14cf74b090ffe8def9013ca4bb448b4c76e98fbfe20c58a06e439b9e4e6438",
  "node_modules/@babel/compat-data/data/plugins.json": "574be4d30480fa3b7efb4fd6462a3921c7a8190fe169215cb94ad02f4cc11657",
  "node_modules/@babel/compat-data/native-modules.js": "d65a57a748b4b9fd2666d7ddda77c799e236b62e0f4c9cd489121295d9cbc9fe",
  "node_modules/@babel/compat-data/package.json": "a871a1f7397a91d00f877751ab2da88904ff1dd30c5bb4ab2e5badd9f3adf6d4",
  "node_modules/@babel/compat-data/plugins.js": "66ac3f8a8c710de59754e76f5f092aac6386bcc837ad467d81691a4c6d885a3c",
  "node_modules/@babel/core/lib/config/caching.js": "21597245d8095abef82ba76135fb13ba083f9460d836296c3b46953870ba1ab6",
  "node_modules/@babel/core/lib/config/config-chain.js": "7dedcac829299f6488a3a9a0dcb2d8987c5b779292a666846fc8bd99f1d41175",
  "node_modules/@babel/core/lib/config/config-descriptors.js": "111925e6dfc98cc8b741e7cb4afa4eb8f73568f140541bfa688e46b57cec317b",
  "node_modules/@babel/core/lib/config/files/configuration.js": "0a2a67b52516a84217aaaabd61112609241a7b320a6a4a79de9615da33da65bc",
  "node_modules/@babel/core/lib/config/files/import.cjs": "af662c2dd5c40dca278b1042e0b3bf233094066d20732c9a62a31f22528e2861",
  "node_modules/@babel/core/lib/config/files/index.js": "d637cd7e8a77af5f45b27e6e5ba6625cef14ad880752f4b566c9107692c40a8c",
  "node_modules/@babel/core/lib/config/files/module-types.js": "faacf19e8f9c2a76995db416a494150c3c08c823b3c4c24b2aefa89ec3ef78b1",
  "node_modules/@babel/core/lib/config/files/package.js": "81561b31e3488c0d82655a6e8a80f3c6ca490ccea5274eaf5b2b2ddb4fe9bfcb",
  "node_modules/@babel/core/lib/config/files/plugins.js": "513322a7370310e0d3eba5cb0eb2bbaafb1847cc4352bf73efa3485c4f77fefb",
  "node_modules/@babel/core/lib/config/files/utils.js": "aa96789e469c230d78c99b6a91011062b07d611b556e02493b7b8abbf2214627",
  "node_modules/@babel/core/lib/config/full.js": "1137fa61f113c82bc016c601c8286cb5967eb477819bdc2fd88f81e71f4cfd3d",
  "node_modules/@babel/core/lib/config/helpers/config-api.js": "18546964f96c9aeb19b3a694e987e594163f941e78f9b83da97e9d2a0b6024b1",
  "node_modules/@babel/core/lib/config/helpers/deep-array.js": "6dd7d03d5a6b990947f5ff5f7ce3afec5d96bfd34432313ff09e0a90f201c981",
  "node_modules/@babel/core/lib/config/helpers/environment.js": "c74e0591757ada808596e7068aeac12bf2898ed6857f395c07f5fcaddedaca20",
  "node_modules/@babel/core/lib/config/index.js": "0db68e510e209917c9c405dcf86b1863c82ed7e580d3c461b20e785665673f02",
  "node_modules/@babel/core/lib/config/item.js": "0be364cf4291c92bf7d7666caae973a59655b11d8c7957232b62c699a7a5425e",
  "node_modules/@babel/core/lib/config/partial.js": "710d24af0c1eaf04b648b856eca97371533dc58c5043e0ab92a23d327cb68ccf",
  "node_modules/@babel/core/lib/config/pattern-to-regex.js": "16c889664261530c3cd3dfeffe7bb6f88237608d479628d0f0cd2493835635dd",
  "node_modules/@babel/core/lib/config/plugin.js": "b59ccee3e4e417e3d2c3dcc621f9708df9dd140ceb3fdad313dc874a82558ec4",
  "node_modules/@babel/core/lib/config/printer.js": "558c215fecd52681b0e4d4f0e473df122a9f8487335f6a9351828c6198c106cf",
  "node_modules/@babel/core/lib/config/resolve-targets.js": "c46e3fe1595fe9c7a3218aa4d2b9b04a5a970202618eb5e7edc7dec6ea41144e",
  "node_modules/@babel/core/lib/config/util.js": "8b7c7379f1c20145b0ac73224f6883e8147f8794e7b96bb8db7ae702f43e8f85",
  "node_modules/@babel/core/lib/config/validation/option-assertions.js": "ea3089e69e6c9a210b4a714d0726b34d3cb214d8278ce0791c907dc7caa21e0e",
  "node_modules/@babel/core/lib/config/validation/options.js": "4d7ff3edafcca7153d4a2629f58a9cfcf48da8b049feb7f5124f766011205b4c",
  "node_modules/@babel/core/lib/config/validation/plugins.js": "1c9c55893ffda1d11a829f4a69e8e2ad26dd60309a5fc57ab49ead12af165a75",
  "node_modules/@babel/core/lib/config/validation/removed.js": "744c81346f2327767b11d61e1a0bbc6e7af565c43010eae53c94763379d35451",
  "node_modules/@babel/core/lib/errors/config-error.js": "8557b579ab2647581f4ad571ee4a84ed2e66247f4d6b9fa0f56869cb85c0c0ec",
  "node_modules/@babel/core/lib/errors/rewrite-stack-trace.js": "e201e122cafddc929abc2accd053b7933bc8cb01180f4a7f6382937080c88676",
  "node_modules/@babel/core/lib/gensync-utils/async.js": "043296a02d18004c7f1b85e25f19db3fd5a875331230beded4530c5f7baf224b",
  "node_modules/@babel/core/lib/gensync-utils/fs.js": "b3a132785272be443b5298772299b11dfa016251bd097794915c34b447ce1dfe",
  "node_modules/@babel/core/lib/gensync-utils/functional.js": "df82f6980855ff7315ee420c6fcf7f6fc00ad1ce63ecbd92dce427151a974547",
  "node_modules/@babel/core/lib/index.js": "dba868255b447218cd421b30fb5289c118f265817088e7106053cf962057dd26",
  "node_modules/@babel/core/lib/parse.js": "6b53bf3c11fabec8967401ab96fb4c8bd9f54f70ae142cbf5903c349a8d70b41",
  "node_modules/@babel/core/lib/parser/index.js": "0020f61256384f275fb4b30db2b4f41951bd2c053363b301f06cc256b337d048",
  "node_modules/@babel/core/lib/parser/util/missing-plugin-helper.js": "a429a257a445bd02cd6245c2fdcf15f5cd1aa3c65ccb679aad70b8a87bb258bc",
  "node_modules/@babel/core/lib/tools/build-external-helpers.js": "0880c2a635627eed182a060b334914fd9299bff18a481ba2c0c8f260492ff7a0",
  "node_modules/@babel/core/lib/transform-ast.js": "ed2ef4a519152a52768d7d98ecbe90e674a8c744545068d348c96b7131d8f5c7",
  "node_modules/@babel/core/lib/transform-file.js": "7c34b7adfc3ea8e7abf637a1c4f5d06caa5eabfaf79365101a14516fb952f474",
  "node_modules/@babel/core/lib/transform.js": "daf9c1faa6ad77c36ee0ba00e1aa989a23b1e010deec4362a7155f14e37651db",
  "node_modules/@babel/core/lib/transformation/block-hoist-plugin.js": "397651e68092230193a61e93e62423169958af2aab853cbcef86a9e94e20abcd",
  "node_modules/@babel/core/lib/transformation/file/babel-7-helpers.cjs": "4b5e82955f8f1edac8ee43c8e5ec32b9ee6e5afdd97f7fd298a169e6dcd2a5af",
  "node_modules/@babel/core/lib/transformation/file/file.js": "529eaf6e795a10158badabefa982b2a932a3fcb4edd0c78688726288776b662c",
  "node_modules/@babel/core/lib/transformation/file/generate.js": "cf80e8aaaa7f4e54eb174069712a7dc3a46e425b8404fbed6a3e1384006a3452",
  "node_modules/@babel/core/lib/transformation/file/merge-map.js": "568360313a672ce0f575fcd3535899bc88f9df43a5f7a459f8e25093f85d8116",
  "node_modules/@babel/core/lib/transformation/index.js": "8b2f87e60d41f057e42a3728bf68e6e7548b26620f82edee54ea1eda39b4071e",
  "node_modules/@babel/core/lib/transformation/normalize-file.js": "406006b6ce5669dc6376c7237ccbb8a6ed31d83065732688aa87a5392a75991d",
  "node_modules/@babel/core/lib/transformation/normalize-opts.js": "baae9e12bb85a18c9fa1f4ee80c1ec41c307013c157e4628c95796048e0e7f49",
  "node_modules/@babel/core/lib/transformation/plugin-pass.js": "46716c9dfd034abdd1cbe1fdaeec928f167847bca764c93857b89e314bf1d48d",
  "node_modules/@babel/core/lib/transformation/read-input-source-map-file.js": "d6688c58230bba99c9fe935a3fa421692752d28e2ad2c10628cad190a910d45b",
  "node_modules/@babel/core/lib/transformation/util/clone-deep.js": "101f894d0a834318e0b65d4d8a1cd34bd306fcac968551e46c219c955db0b2c0",
  "node_modules/@babel/core/lib/vendor/import-meta-resolve.js": "8d357d211f43738bfe51ef8c1ca094ae45b62b3e58563584072d35be1e7007f1",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/buffer.js": "88636e1c3be7d84bf0c28a57e778c969d79ee6925ae8f89eb3ac14ecbfa9b46f",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/base.js": "39d132506cb25608242ded36f365f693c3242baf84c2bc0c0099f3b5179746a8",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/classes.js": "ef1d48011af7fd1d62517ad84f8a7bb2cb47c09e255e3b819a96e04fdcd0f158",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/deprecated.js": "4959bedaa1128a52a1288b81e387bd5e8b8c0b8e478f6184db4c702f9c8565d7",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/expressions.js": "d956a15125e3cf45ea7c03ec659260ba12d3cb42a63968b4469642dae2541af1",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/flow.js": "5f317726aa77fefed4595ba60760157b3c029af32f088415027474c2c10f2078",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/index.js": "e86e6e2f58829b30d9e5d4232404a2925cefe09c2345a4abc83072c7b1f2fb34",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/jsx.js": "ba2dc7c800ba8722ca2e5ded86374d08c4286a118100a14647f34d18f6e2d146",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/methods.js": "acaae0a027cde72695f57e306fd91f0c1bb29b0e5c3a2a17fb6aec2547618a7d",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/modules.js": "18ad8f0a9fde735d160a6213db8dfe08831bce11d8a34aeba8ba9a2ed106146b",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/statements.js": "5ba93927534a005b2e77645de2205ef27bdcc42691c4afdc9b3dceba9ce6b401",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/template-literals.js": "8791a02ffac04f2c82e729ba792fba1bfab1ce56186efda99dcaa3a9f7ec0e34",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/types.js": "729632800770cf42d849041a2194df33f78b562142e289588ea26517426013d1",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/generators/typescript.js": "86901012011cb1ed7244889e90c4b119548d7143822d17b0af0de3d23be15c9a",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/index.js": "889bf279133b5246d535e8c8755cdf9d4b45c968954ed19ab89daa577c8600af",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/node/index.js": "24c6d57bc26c29d25bc6dc169a48a9376f16641883fbb3ca0cd1083683e05ba6",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/node/parentheses.js": "2fc7d378aaa7e540c2f6793ae14477bc99db3ed5943febbc8bbcd9ea8d8e5656",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/nodes.js": "1ee21217f8858c61a943d7ed92fabe74c860fce87e4eaa38d460f31483a27e14",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/printer.js": "44aa322fbfbb70411253f2dc3b1272514999dcedf29dfd9cd1e08a4a0f9534cd",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/source-map.js": "19771e3c8331eff4ff442a471774596d014b816740dc4dc4e956114d25b0d89d",
  "node_modules/@babel/core/node_modules/@babel/generator/lib/token-map.js": "371cde64af69056492b3261477688a502ec948057e9325a24593a3fd9fb15e58",
  "node_modules/@babel/core/node_modules/@babel/generator/package.json": "9abb52650988f263a4e319eba536f7cdd681ad71b1e1383acb7e04f7825bc409",
  "node_modules/@babel/core/node_modules/@babel/parser/lib/index.js": "82d72e197e27bf909ae10ffc8d1a969aeb94fe96ec96c4e9cb685a0a8229e40c",
  "node_modules/@babel/core/node_modules/@babel/parser/package.json": "fa70cca00587bdb335e8249fa40e9356ed7b7c9a4fc92b1e74245ab1b852cda1",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/cache.js": "6686154187be66f8056759aad88337450df9be1679c060a69f47ea638046e112",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/context.js": "e20f034b033a592151f84214697cf85e30bf0282cd51832567d6c3f918c1f1fd",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/hub.js": "bd60df819fe6e9bb658139d57a253b2d9fb7899541e8f4f65bcf7ee88ad01a7a",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/index.js": "49ae3f03a47b7e52f15d4ae6c6032fb180ac1e1ba8dd803a906fc8c36a009694",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/ancestry.js": "b15b8a29b1abdacbdc1c94a7b70ebda028f9f95c65e24cff6d1f911e753697ce",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/comments.js": "7aeff97defe6a3f3ae9d32d3741407d3697ce37a3edc29f76633cad2cbd44092",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/context.js": "7836ded88b5f03025853e34194301fe9c1994b0997ee0482d067246bde65fd4b",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/conversion.js": "efa58f278371523574f5014b8665262012abf21859a254ec3a70b4608629c8a0",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/evaluation.js": "cee4ee6ed762e04af1701d86501a3bacc99f152e0e25a2ab899bf88c99657c01",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/family.js": "3a15514cd4b078f99a4bbfe058253acb7026e911109152afa11211c76608351f",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/index.js": "0c04dcaf6b53238d137aaec13dbbfa1c43366fdceb6550b99cfd0e449aae6efb",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/inference/index.js": "3be0c3e5d93ad61f4f5cdd81931ff105bfc66b0c682d2998a58e4e968620ba96",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/inference/inferer-reference.js": "6c435b1561c94ba3cfcff79d7acc3d36dd0f0e961f4344265699f6e111532c0e",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/inference/inferers.js": "f7e1d9b6a10b54f9a8e2efea4ce9220a8d52433c115092d42a863f2b0c3b6cc0",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/inference/util.js": "044824f294296671dcb241f20fcfecc76c1c6ebdb2a498a96332dcb22f2b8ca6",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/introspection.js": "b747b118fd2293939d0b1e088806fd2e9705481897ec401396f17ed724176bdb",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/lib/hoister.js": "1b2a6c39b19aa8718b43619d45bc314fdb6d80b9907a1ff7e2da1fe95a88c14b",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/lib/removal-hooks.js": "02939b9a138bb0503bea64a0741bf7045a260a97d5f73fdfeda398f2dc470bcb",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/lib/virtual-types-validator.js": "056c9b404f2376b0324923e895074160df8d6ec09573a6b70205a04e076d2450",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/lib/virtual-types.js": "8fdb98e41abb086c6019b611adbed559faa0223b0ad35ec836fb4cb5d2f8276e",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/modification.js": "0919acb5d1e5984a6461eadb1cbdabd467f7cf971757bd2f895b36523a39ed23",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/removal.js": "3cc09e484d3e7f5e7bfec4152e1fe00e8c6b326fb5ac8d8eb87f367e20b19f7a",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/path/replacement.js": "b533ebbccf0e61d1504d7182b0ce4b21c222f34bd2b2e3b82b2318da458645ae",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/scope/binding.js": "96b682a8cb76d0842f8aa05c9867b872127cc928c243730e0577ba7db176cc41",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/scope/index.js": "52982a35ff00f1b57940f780c47f32150b5305c3d0963fb5045a69d7e511d983",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/scope/lib/renamer.js": "6b3a7b04aa231892652c0c4fe01185a4977b29872800abd6b8e4cf0e4ae9f50d",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/scope/traverseForScope.js": "3997a50316cc7ff484bf0de0d9857f80c5ccc4a7aceb69762305ba29dad133d6",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/traverse-node.js": "cd0474c6d7bd65f232ae4c7ddaf1d8e902650a9298f34ce3b85481ced3aab73d",
  "node_modules/@babel/core/node_modules/@babel/traverse/lib/visitors.js": "e79f30f6e044adb3597f06d1a476ca741eec093ab7edd8e3f3a1fd9bafeda681",
  "node_modules/@babel/core/node_modules/@babel/traverse/package.json": "a1cc0751121cf332f73a42a394518f0e4090e9c45febc8887d047fbb72ca7d7b",
  "node_modules/@babel/core/package.json": "6c2893db41b54a1c03ba68e676aa3ea987db9a5c9b9a3a3aa2e8d0d9a63066c4",
  "node_modules/@babel/generator/lib/buffer.js": "f51f2cef71b84754b964e09971b658a9995fbf3a889b1bbb14340ef1913102cc",
  "node_modules/@babel/generator/lib/generators/base.js": "f0cba6a039f96c1e245d6d778b9fa3ec36961a1f8840fd88251539df7d666f19",
  "node_modules/@babel/generator/lib/generators/classes.js": "d7cc4771dea4921949917ad45f7fee97975b597ed5ad43816361f776a2318c29",
  "node_modules/@babel/generator/lib/generators/deprecated.js": "0b9f888e915dd71164d3dfd78394acd15f215bd8592d8d627757aeb9c7f6544e",
  "node_modules/@babel/generator/lib/generators/expressions.js": "e29cd8effe5622a44eec97df0a3f2e5eda3b864d9af477ccd20b337d3eb6fd73",
  "node_modules/@babel/generator/lib/generators/flow.js": "d730dfc1eb1284724f64d5e1e3bef7eafcd3cc7f323ae8c83a36dff5a517a438",
  "node_modules/@babel/generator/lib/generators/index.js": "e86e6e2f58829b30d9e5d4232404a2925cefe09c2345a4abc83072c7b1f2fb34",
  "node_modules/@babel/generator/lib/generators/jsx.js": "6e9fa068cd121d59c2c91c170140f845558149fefd6ccab255267a86dbffa405",
  "node_modules/@babel/generator/lib/generators/methods.js": "944975239553f0a4ed8b938fc8a0aa3af7c9a0f23ef77ae155e908fbcbd3d706",
  "node_modules/@babel/generator/lib/generators/modules.js": "39dd14f3e802afe6e55d7a69365e997395020fa577cf2964b808d36fc583812f",
  "node_modules/@babel/generator/lib/generators/statements.js": "669dfbab95417562a0cd4ac54ed1500b8544746fc3159519b8656bbb9b487ab5",
  "node_modules/@babel/generator/lib/generators/template-literals.js": "957342c2b2369590dec2d236f153c1ad7dfda490a3f41530ac6a9b5f060ff1e4",
  "node_modules/@babel/generator/lib/generators/types.js": "bbfd954da6b9ba64f5b667531803061c093abab028881d3f4a27c65b6078b11c",
  "node_modules/@babel/generator/lib/generators/typescript.js": "a8a246465f7a85708e3ff733724624014aa270733ba788ac61b1558534b2399d",
  "node_modules/@babel/generator/lib/index.js": "8b14cedcc66fc84d424b5890c135ad77bb5978adb177fe7063e831cc9358af04",
  "node_modules/@babel/generator/lib/node/index.js": "a737a3f2ab582897bb2a46c0137ce2b5d3d92503754bcc6bacb3aaa864431b42",
  "node_modules/@babel/generator/lib/node/parentheses.js": "4e322e029ce2730aee9c8d99e1dbeaa0e142660a162da6775030007c5e7f99b0",
  "node_modules/@babel/generator/lib/node/whitespace.js": "838027e06fa5ac5028fa879da0e0ecbceb0dfe96d06fffd67f941678bdd66c5a",
  "node_modules/@babel/generator/lib/printer.js": "de16ad149f493828c18043a774a45463c99c57031029642b35890f447a7618e8",
  "node_modules/@babel/generator/lib/source-map.js": "c0f35f0ddaee1a8034dd60298b5c8b4c4b5cef0e5b8e9ab2705974159a62ba45",
  "node_modules/@babel/generator/lib/token-map.js": "8d1e77f760457fa121fca5dade80ecf4b37e624e534558b96142fb08233209c4",
  "node_modules/@babel/generator/package.json": "7e2b5ef1c5ca7e15bdebf51eb7720cac2b5063d66444e515bb94adaa5dcc4c64",
  "node_modules/@babel/helper-annotate-as-pure/lib/index.js": "1783d2bd9b6db30c2e276158d29b77959a5dc8b9cf3b3a75510629b39b79a0d0",
  "node_modules/@babel/helper-annotate-as-pure/package.json": "2fb83cc5029a69241bc3005b23e67e69d77cee3aa73f42e75d9177e5c125e266",
  "node_modules/@babel/helper-compilation-targets/lib/debug.js": "b5b23f2ccd2420c3943cab045962f8a82bb3251c97d8c411c0af39f584034aff",
  "node_modules/@babel/helper-compilation-targets/lib/filter-items.js": "f5ad422832bb605f0edd58203af48f2415d680f018fd7e9c38580e5fc3939b69",
  "node_modules/@babel/helper-compilation-targets/lib/index.js": "9374b9b7a017db5530efeadc6c17fb5421772ef80f85f46a8d0a5e8e14dc1df8",
  "node_modules/@babel/helper-compilation-targets/lib/options.js": "44b239c5e79f4460bef68a39810d32d09cc639b7ff878f6a16f6f80d6c56ea9b",
  "node_modules/@babel/helper-compilation-targets/lib/pretty.js": "0ca1ed24b41d439a278ef79f751523dc77ddde5475acb8ed9042666ff4a7e570",
  "node_modules/@babel/helper-compilation-targets/lib/targets.js": "2e8e493d7dae85b19b9fa6252388ea72795c2645c25aedd4e1f66ba31f968119",
  "node_modules/@babel/helper-compilation-targets/lib/utils.js": "d74b41fcb6d47fd4e7eb9acdee93770b83adef6ca20b0accfbee26bd5d83b511",
  "node_modules/@babel/helper-compilation-targets/package.json": "6ac5b42b124c964fb3c0feed98cd2c13aaf5c5827021374db6884bab91f206d2",
  "node_modules/@babel/helper-globals/data/builtin-lower.json": "10a1d28c90e86d70e31fd9d21c60adcb7f134959bc64a64254fa3d9952be16b9",
  "node_modules/@babel/helper-globals/data/builtin-upper.json": "49de1ac44975edbb209431cb75f2174a5507e6714985d40cebc822d5ae1beaed",
  "node_modules/@babel/helper-globals/package.json": "c06a17222ad81933dbae3768fe59cd6737ebdcfa88b84097f3a8e659e28d2c9f",
  "node_modules/@babel/helper-module-imports/lib/import-builder.js": "0b68863623592ca8d46987f9606e69c84d2aae336968fd20768314e676c28f5e",
  "node_modules/@babel/helper-module-imports/lib/import-injector.js": "cf606e01425db891f9d1858b5eb641483a0f16865b9cb9eab01a3211e13f045a",
  "node_modules/@babel/helper-module-imports/lib/index.js": "233349c8482863c4bfd2656c940b0a3f22448c1420b2957bbdfc498c94dab87f",
  "node_modules/@babel/helper-module-imports/lib/is-module.js": "624f4b427ea97bad24b1a0133031ab4eb889aa066afa5a5294e5dd38200a5ab9",
  "node_modules/@babel/helper-module-imports/package.json": "fa2e7c54b6b86e250770f9b2703571bcff0c8166995e01c756539745859fedb7",
  "node_modules/@babel/helper-plugin-utils/lib/index.js": "75d07ef0d14cd4e03251af706a1d2912c2131c9726e9b973db4670b75bff00bf",
  "node_modules/@babel/helper-plugin-utils/package.json": "2ce650d5c6bd8c1d1111ada7f39de65c48c227c25af74031493a377eb9fc3691",
  "node_modules/@babel/helper-string-parser/lib/index.js": "c1b1b25a48d3b44710984b894db71f5e8c335ca52c35da43e73967c20cf18bfd",
  "node_modules/@babel/helper-string-parser/package.json": "ecbd1aaffa9ad000d3bc5a526067b89244cb3ec64c738fbae8b64a9e805f401b",
  "node_modules/@babel/helper-validator-identifier/lib/identifier.js": "1f6f6c5d3b2ed3bc6613ad93fc0c9eb54c04be5013241bf391f3825c16b4432c",
  "node_modules/@babel/helper-validator-identifier/lib/index.js": "98df6c259dc29b4082858573ffd24930ca68a7bf531a10f48d856ae813b9acbb",
  "node_modules/@babel/helper-validator-identifier/lib/keyword.js": "1f27b5bd2ad2601730b85d1391a242604414a66026651d762179d5639b0b4c73",
  "node_modules/@babel/helper-validator-identifier/package.json": "1ad6aeced8b186ac259da45fea50ab9d65d3d958f6458c80e3c8013649d1b12d",
  "node_modules/@babel/helper-validator-option/lib/find-suggestion.js": "57310ed660b1f93412ffde3c5d00ccc0bf7b5e6881925dbbfeaeab248ed18d3d",
  "node_modules/@babel/helper-validator-option/lib/index.js": "f88b48887e540ba645aee55b29dbfe810b9318a8b757748cddab83fc948e562b",
  "node_modules/@babel/helper-validator-option/lib/validator.js": "9ef8ae61b61c1fafe80d4a2dae260e64f2eccdf4ac0b9c72f3bd1df4ff157c43",
  "node_modules/@babel/helper-validator-option/package.json": "b2d7eca451e536f18f4757a54be48df604385ad978508e32ce8f2edb4973f257",
  "node_modules/@babel/parser/lib/index.js": "4fad5d076afb8c346159a06bb942d6e14c6167d590082b7c3bdebd4c108af201",
  "node_modules/@babel/parser/package.json": "06e89556fea2851b071797c63c0565725ba8b889014a07ac6ad62dbde52157de",
  "node_modules/@babel/plugin-syntax-jsx/lib/index.js": "9a05b79b51e6f2d61c95cf504b7f7d568687edb5e9b899a348c7edb87ad043dc",
  "node_modules/@babel/plugin-syntax-jsx/package.json": "0837c35659148215b2804bfb7581486a66a11c4bf6ea7d4a7dd09a16b9968bad",
  "node_modules/@babel/plugin-transform-react-jsx/lib/create-plugin.js": "ce6ff3d3b784e7459ec168d70084f3ded9d4819f5130d1fc5d06e5dab97b95f9",
  "node_modules/@babel/plugin-transform-react-jsx/lib/index.js": "706e6aee5f161a91a0e611b93fac5f4fafbafaeb71bc57514a5bf76b4fd8341b",
  "node_modules/@babel/plugin-transform-react-jsx/package.json": "a731eb02fa9f163e0250ab1c6b163f8607d16ce5c2ed0d3fb81e60774f45eee7",
  "node_modules/@babel/template/lib/builder.js": "70e99636118c7cbbe0d89564d747dccc6e2f88087df067c822b2f72caf41f4ff",
  "node_modules/@babel/template/lib/formatters.js": "76ba96dcbc958906465e9848ffa717d70664e33752ed5dda7e1ba7ee2885dc55",
  "node_modules/@babel/template/lib/index.js": "afa3d50840abdd95e81d3e00dd8539c448b533767f899dcedf4dac776ddff9a7",
  "node_modules/@babel/template/lib/literal.js": "806ab870bc8c219035d237b69bf82b2a406413907a25ea377fd1daa7678d9a6d",
  "node_modules/@babel/template/lib/options.js": "6ccc52bdbc647a402860400b427f2db2bae027aa069403a8615ecb79b129d413",
  "node_modules/@babel/template/lib/parse.js": "a9893d72434528cda653ab8fdcb788d09cd191e660055ba0804e2dbe26f3ca39",
  "node_modules/@babel/template/lib/populate.js": "d5908f45bd42d37feee9cd8ad2b1b000619dabdd2a44f794e479649ef14af04b",
  "node_modules/@babel/template/lib/string.js": "d50c4190b5aa5da0d01b5e3ded6e53d1c0739eec8aecd0b633e3567b26b1dca9",
  "node_modules/@babel/template/node_modules/@babel/parser/lib/index.js": "82d72e197e27bf909ae10ffc8d1a969aeb94fe96ec96c4e9cb685a0a8229e40c",
  "node_modules/@babel/template/node_modules/@babel/parser/package.json": "fa70cca00587bdb335e8249fa40e9356ed7b7c9a4fc92b1e74245ab1b852cda1",
  "node_modules/@babel/template/package.json": "82b96cbb7f576768c6298b816600c0cfb2d8487c963050406d2bd895e3724145",
  "node_modules/@babel/traverse/lib/cache.js": "a75e3c4caa6faae0bc2835df475602c15fee7309c31361eba78d2f14d2ca6637",
  "node_modules/@babel/traverse/lib/context.js": "3b449e4e623e3e086f177426232ea422edaf03f189cfa7f92825ac34d0dc072a",
  "node_modules/@babel/traverse/lib/hub.js": "bd60df819fe6e9bb658139d57a253b2d9fb7899541e8f4f65bcf7ee88ad01a7a",
  "node_modules/@babel/traverse/lib/index.js": "49ae3f03a47b7e52f15d4ae6c6032fb180ac1e1ba8dd803a906fc8c36a009694",
  "node_modules/@babel/traverse/lib/path/ancestry.js": "b15b8a29b1abdacbdc1c94a7b70ebda028f9f95c65e24cff6d1f911e753697ce",
  "node_modules/@babel/traverse/lib/path/comments.js": "7aeff97defe6a3f3ae9d32d3741407d3697ce37a3edc29f76633cad2cbd44092",
  "node_modules/@babel/traverse/lib/path/context.js": "ed52278954c2e3942e958339643f526bbba2f6baf30f4e70808bb406299a025b",
  "node_modules/@babel/traverse/lib/path/conversion.js": "1ffcb15d52d99e7fc4ee04a789d7f23f74e4d91af4559f966cb7375f8ccc6ca4",
  "node_modules/@babel/traverse/lib/path/evaluation.js": "09571699aa131c34e3c285e6f72c9e0ae746292e9cae52703b758559e01e1131",
  "node_modules/@babel/traverse/lib/path/family.js": "3a15514cd4b078f99a4bbfe058253acb7026e911109152afa11211c76608351f",
  "node_modules/@babel/traverse/lib/path/index.js": "2b1c745c9781e1636f37be18fd150fc1cb1c93778950e9818128fdbd5c226850",
  "node_modules/@babel/traverse/lib/path/inference/index.js": "3be0c3e5d93ad61f4f5cdd81931ff105bfc66b0c682d2998a58e4e968620ba96",
  "node_modules/@babel/traverse/lib/path/inference/inferer-reference.js": "6c435b1561c94ba3cfcff79d7acc3d36dd0f0e961f4344265699f6e111532c0e",
  "node_modules/@babel/traverse/lib/path/inference/inferers.js": "f7e1d9b6a10b54f9a8e2efea4ce9220a8d52433c115092d42a863f2b0c3b6cc0",
  "node_modules/@babel/traverse/lib/path/inference/util.js": "c5db5552e66310f8895f00d8a195dc431fd0bb798fc141483e226055df4cb59d",
  "node_modules/@babel/traverse/lib/path/introspection.js": "ab007cac5b69966cc9d5ff064edff9084f3740fe0c22e6e822dbaffdd4fa7d75",
  "node_modules/@babel/traverse/lib/path/lib/hoister.js": "1b2a6c39b19aa8718b43619d45bc314fdb6d80b9907a1ff7e2da1fe95a88c14b",
  "node_modules/@babel/traverse/lib/path/lib/removal-hooks.js": "02939b9a138bb0503bea64a0741bf7045a260a97d5f73fdfeda398f2dc470bcb",
  "node_modules/@babel/traverse/lib/path/lib/virtual-types-validator.js": "37378315bd25cfd700d014029d6b0e7ae264fae2dca03f580e7e60854dc49d00",
  "node_modules/@babel/traverse/lib/path/lib/virtual-types.js": "8fdb98e41abb086c6019b611adbed559faa0223b0ad35ec836fb4cb5d2f8276e",
  "node_modules/@babel/traverse/lib/path/modification.js": "26b38cf5d554809a9cd01a07f230a1bfb1174dc23b68aa97857dc7e8278a2dbf",
  "node_modules/@babel/traverse/lib/path/removal.js": "3cc09e484d3e7f5e7bfec4152e1fe00e8c6b326fb5ac8d8eb87f367e20b19f7a",
  "node_modules/@babel/traverse/lib/path/replacement.js": "e46e02b21576ef1164512c31e4f8d0033b4833dd136688895cda678f2f374bef",
  "node_modules/@babel/traverse/lib/scope/binding.js": "96b682a8cb76d0842f8aa05c9867b872127cc928c243730e0577ba7db176cc41",
  "node_modules/@babel/traverse/lib/scope/index.js": "ab2a29155bb827ac40054bfb262ee61869c3eb76740119a77087d2c9de72fb9f",
  "node_modules/@babel/traverse/lib/scope/lib/renamer.js": "6af241ef0af8bd64474b6638705850f5d8abfe66e3111905f34974c3eab0dd1b",
  "node_modules/@babel/traverse/lib/scope/traverseForScope.js": "91d8a958d6b379f6f5465a4070afa275daa425d63c3e1f231e8a3e66a6150498",
  "node_modules/@babel/traverse/lib/traverse-node.js": "42519af551cb1b696baa922057a2045a0f01e30229e6fe7e88e31ad4b357bd33",
  "node_modules/@babel/traverse/lib/visitors.js": "facad4c8fba6afed59ed992b5c7bc96ea16aef00cf2399525655c14144d46397",
  "node_modules/@babel/traverse/package.json": "02d2adde6cee2e3ec2f56d669d7b44a80c133a78985fbdd16ae5344ef2e3b922",
  "node_modules/@babel/types/lib/asserts/assertNode.js": "f5daa3d19be4871e94dc56fc97b412c9a2db30e60d3431d5e21b4a8f15fc254a",
  "node_modules/@babel/types/lib/asserts/generated/index.js": "0be5395e6c70928b772a0dce8e7783e9ddc9322e3a1a5f0c9643cb2ddfd9a4ed",
  "node_modules/@babel/types/lib/builders/flow/createFlowUnionType.js": "d956848a9ebd7c485908f46c0ce527c83509e952872b4aec8de995434f2369a1",
  "node_modules/@babel/types/lib/builders/flow/createTypeAnnotationBasedOnTypeof.js": "5a48d7d1ffabb37f39398d080ced7dab04f45a45b0e373b1c90b2bd8f36ed727",
  "node_modules/@babel/types/lib/builders/generated/index.js": "a7c533725a73a24bff6d299f056c977204ee53ee4180d007b6c2f74b6c8ef142",
  "node_modules/@babel/types/lib/builders/generated/lowercase.js": "665aaab2c379fc7f2975fb3d690af397ad95e7b2a8c6761a9208229b63946f41",
  "node_modules/@babel/types/lib/builders/generated/uppercase.js": "f4ec3b4f98b9d6f4af4eebd4e81f4529097b8eb8d908a8a49f3ba137237a9108",
  "node_modules/@babel/types/lib/builders/productions.js": "ade4f557ede9b5efc677944db55387d17d34787f259b6cb4a69334b52f84a224",
  "node_modules/@babel/types/lib/builders/react/buildChildren.js": "80cee92f7e6c583065b8b10e83b1d0f90ae5b54e41052e452fb08463945c272a",
  "node_modules/@babel/types/lib/builders/typescript/createTSUnionType.js": "0b8303cee403bcd242adac77b969b3470935469a530f4241675015235e827e10",
  "node_modules/@babel/types/lib/clone/clone.js": "e111ca75eaceb1f7df18f83ddea547562e9f7fb344e6a9b14b613a587b34bbaf",
  "node_modules/@babel/types/lib/clone/cloneDeep.js": "952c6eec4f23534d5a3f8ce0902fde9473ddd8f19a51a8ec841f414acc3bea1c",
  "node_modules/@babel/types/lib/clone/cloneDeepWithoutLoc.js": "1262732b2d97398c6fc1347cf749a4a7e35b8fc13e24cf0563544e26f52f395a",
  "node_modules/@babel/types/lib/clone/cloneNode.js": "7db899dfa4caeade05d282c25f3dafe4ce296cfc6c011658b455f46e12a5273d",
  "node_modules/@babel/types/lib/clone/cloneWithoutLoc.js": "11400139de42cb806781efe3f1ef1c37868be98574faba096e46abab67ccb404",
  "node_modules/@babel/types/lib/comments/addComment.js": "f1e5431cba374c103a614e1db06e197fb9c99feb0c09fb81617eb5941717a3ab",
  "node_modules/@babel/types/lib/comments/addComments.js": "7a421e7c608ac0ca7790fd17a1abc2e48367f56eb1f99d4de6eeaaef99d7590d",
  "node_modules/@babel/types/lib/comments/inheritInnerComments.js": "e4f19c43943fb5b6877396941ad43d5b8870fcdcf20ab741456d29f38b857b46",
  "node_modules/@babel/types/lib/comments/inheritLeadingComments.js": "31839b52f4d08f4a1e1dd91ce812c51e329b2f942840e683bfa5395a97b8fdd8",
  "node_modules/@babel/types/lib/comments/inheritTrailingComments.js": "33c5268d1904b88b29766c60324a2e5711628b0be643e25b3fd2b9b48fa430d3",
  "node_modules/@babel/types/lib/comments/inheritsComments.js": "bdb71fca3509759b0d865d69f3245df126aa3d822748f0ecc8e716f28876a31f",
  "node_modules/@babel/types/lib/comments/removeComments.js": "0eef78919eccd6ae358620c4c11ed72f31ba302b3cf194143b45556e73c354f3",
  "node_modules/@babel/types/lib/constants/generated/index.js": "539fecb078ee358d5fe9c5a011237481589c829c28d7775d00675fd1e4d63ddb",
  "node_modules/@babel/types/lib/constants/index.js": "299fe69d83a7611c257e86d8fa2ebaea69aa7291a3ab265cd20d3e36958050a4",
  "node_modules/@babel/types/lib/converters/ensureBlock.js": "d18069705c1be7f10c5e2c2123abdfdfd5182bea1b5c16903c5e5150bbac2262",
  "node_modules/@babel/types/lib/converters/gatherSequenceExpressions.js": "a5d59cdaa56e7c7a40e7bbb131417c19ac2dbd56948f41c410d90937a2948b2a",
  "node_modules/@babel/types/lib/converters/toBindingIdentifierName.js": "1b838848c87490d0b24ce4cd1d0f40619810e90cf69d8e6dae6b87642427e465",
  "node_modules/@babel/types/lib/converters/toBlock.js": "6cee442fe41f7775d2086eff3fc3d1617c45c3958408c314824020ee262529ca",
  "node_modules/@babel/types/lib/converters/toComputedKey.js": "c54a9b025a4c5e7ec4c9b93e9f2b795aa8a6f928e0de1793590f012c78e01b46",
  "node_modules/@babel/types/lib/converters/toExpression.js": "6c836808e3deaf27abb812cdb8fa481c9e075ae1608c5fc4fef441b2742b1281",
  "node_modules/@babel/types/lib/converters/toIdentifier.js": "d7cdc2be7b2f4fb21ee65727893880a33d18582bf6d01f7f24b9b6c4ecbf441c",
  "node_modules/@babel/types/lib/converters/toKeyAlias.js": "35ab0be1595ec7ba03a2c25e5ee865fa73656e50b7ea8a44867268a2b930f62f",
  "node_modules/@babel/types/lib/converters/toSequenceExpression.js": "be7b9a125dc7e2ac25181d766b1cf5c7cf176e09e682aa7f7b57b696c7fde825",
  "node_modules/@babel/types/lib/converters/toStatement.js": "af4719777970692f5a17a549a585eeb93c604cdd7697da3816deb52add4cee11",
  "node_modules/@babel/types/lib/converters/valueToNode.js": "553b89b77a6d123fcfb1318f7d00261d2bcb1f1f9ace4007e54cbbeba70dd403",
  "node_modules/@babel/types/lib/definitions/core.js": "9e93a0b84114f2e5f72e15bf18562dfd8ec84848d981e9677e20da682787cb1d",
  "node_modules/@babel/types/lib/definitions/deprecated-aliases.js": "a5e38c38380667ea4573622ff0661e6bc9b98c967c68789463773d60f72e9852",
  "node_modules/@babel/types/lib/definitions/experimental.js": "1ea71bade729a27a22217f93d9b465b5cbfef33b833840489daf5158c130e82c",
  "node_modules/@babel/types/lib/definitions/flow.js": "38b7051e26c448f4696a4c9a0e3c1ee539d23c34dd2fa3c5d1817bf922a415d3",
  "node_modules/@babel/types/lib/definitions/index.js": "7e8c2e0f299ba5e7871ed4667fc7a33256056917c7960d930c96f1f90bb95e0f",
  "node_modules/@babel/types/lib/definitions/jsx.js": "2454af3ab8ae6d43fd8d53fcb5043feaa1a4cbb34d341c34a7629cabf4d5aea8",
  "node_modules/@babel/types/lib/definitions/misc.js": "606ea8b29f67f66939f04d6d362e7f7a154bad7ddaf749fcd37b7609e942daee",
  "node_modules/@babel/types/lib/definitions/placeholders.js": "01152a0cefd7494a25b1a76a89294d89cfa8b59f3443baa5278d2a9d1932d3a4",
  "node_modules/@babel/types/lib/definitions/typescript.js": "fbb7f546b449698e6615ffbde4e7649b9bda0c4621ad360fc2da7ecd8ed340d3",
  "node_modules/@babel/types/lib/definitions/utils.js": "75abf6f8c7a04776867a1c0891684c4a0e090743cd8a6dc9d127bc957888908f",
  "node_modules/@babel/types/lib/index.js": "21af18add84dbb64a624552e04abad89a40affacf701776d4a662aedef6accfd",
  "node_modules/@babel/types/lib/modifications/appendToMemberExpression.js": "51af6c925e4f4e14331a4c54367ee5d394ba078383ca859e0bc581c43dc022bf",
  "node_modules/@babel/types/lib/modifications/flow/removeTypeDuplicates.js": "a12aeb6657af4ad7f5eea9ac5f8cc684a687ca586616bd745254b10faeb86e98",
  "node_modules/@babel/types/lib/modifications/inherits.js": "8fa7c6417ccadb35ec3900deb4daa612c186ba957b539ad0656c4cb7698b09c5",
  "node_modules/@babel/types/lib/modifications/prependToMemberExpression.js": "1789396d148146e2685138e11edad51986c30d0f2c051071ac4c1da4408e01bc",
  "node_modules/@babel/types/lib/modifications/removeProperties.js": "714f0cbd42d973ade613b6814c9a07bf8238535ce8c9b597b434a8b23e4d4b94",
  "node_modules/@babel/types/lib/modifications/removePropertiesDeep.js": "ddcfeee97410e2b2aa35222224f0ff8edd89560f01188853dcc9cde1b2abdfb6",
  "node_modules/@babel/types/lib/modifications/typescript/removeTypeDuplicates.js": "42bfd0042bb92172fac115f2e3ded4fa313a02557a4b70b6f11485fa527b56f9",
  "node_modules/@babel/types/lib/retrievers/getAssignmentIdentifiers.js": "6790244265636511a227992e7dab908dad0a1029ff9a1503cd009e7fced08178",
  "node_modules/@babel/types/lib/retrievers/getBindingIdentifiers.js": "2318058e37fb5116fec4a8e76a7a8ee0996d5ef75642b4a8d1f10b761eaa73da",
  "node_modules/@babel/types/lib/retrievers/getFunctionName.js": "36ee7283e1ed17e87af9fd5fc64b5b6d7ab63ecb3a9d48814dbdc23060fd441c",
  "node_modules/@babel/types/lib/retrievers/getOuterBindingIdentifiers.js": "9d7e2c5923df3c7e51b4f75e29772a7f824a98395fe70a7ad0134b6ec812a954",
  "node_modules/@babel/types/lib/traverse/traverse.js": "7d4292d3b498d77982806c864dda6f39f6b6f1cc758ba117b66cc0430d45986e",
  "node_modules/@babel/types/lib/traverse/traverseFast.js": "ef4a51459c82a1b9471a55fb09bf763f8c6fa4000418256c78511e479161ac4e",
  "node_modules/@babel/types/lib/utils/deprecationWarning.js": "862ddff494adab4e5e9000da2c44c373a76f54670489a79b590ac91264f72a7a",
  "node_modules/@babel/types/lib/utils/inherit.js": "2c9e7f2b7ce5a57441c4ced2077059d32fc41e38975c8f4a52b6723767d85e33",
  "node_modules/@babel/types/lib/utils/react/cleanJSXElementLiteralChild.js": "595c06790b4cefa2e47ca3758eb51b9d2db1d5b230260d05a5f80fe777839d3d",
  "node_modules/@babel/types/lib/utils/shallowEqual.js": "6ab4703ffc14fb106909ec9be593b6aa0d39e157995dc5b9ea7f8b0f1d85c15c",
  "node_modules/@babel/types/lib/validators/buildMatchMemberExpression.js": "7ff24ec89331024cb6422d4d6ade44f4ade60116df4f6e3b6fd9485ece7f2c59",
  "node_modules/@babel/types/lib/validators/generated/index.js": "f2b78a20cc9fa7d3b83a60cb12253523262ad2f689f36456caf7ce72a2e307f9",
  "node_modules/@babel/types/lib/validators/is.js": "89ddaccb18dc3625cf702e8f66a33d909831b4dd93ac3590cd0ad399b24fb800",
  "node_modules/@babel/types/lib/validators/isBinding.js": "2b64706bb281368be68016f12d62b4fe45de096c71645ba284604211aa8459e7",
  "node_modules/@babel/types/lib/validators/isBlockScoped.js": "c35fefb463b241d03e0b83d42aec85159d1895d89aff9937b604d20f5cb55d02",
  "node_modules/@babel/types/lib/validators/isImmutable.js": "b4663c9b9c8f11807f0eff92b31e03015201ebb42aedde754f9f94a154c97ea3",
  "node_modules/@babel/types/lib/validators/isLet.js": "3c75b0ff25ffbb6793ed34139b4679b0a7faa0c18c9137e01784703dd0466b6a",
  "node_modules/@babel/types/lib/validators/isNode.js": "d242dc73415c4647b3e88f559a5763572363ae01e478d7a1aa2e7d480bf096b1",
  "node_modules/@babel/types/lib/validators/isNodesEquivalent.js": "c4908e3249f4e93cdaad3e7efa92277d0fd62cdefc1bc2c3cc18ad8c0ba5d569",
  "node_modules/@babel/types/lib/validators/isPlaceholderType.js": "59c03db071add873f0ca6ff79745a665601a0ee8e28e6a620dee536461b1b7d2",
  "node_modules/@babel/types/lib/validators/isReferenced.js": "992376883825ab5701ef51fb2960da07e96e67e76d45a557c5ab8ca00eb8ff0b",
  "node_modules/@babel/types/lib/validators/isScope.js": "f97deafe49aaca76c24143e861038f1e69642462a37d8cfdb5c6d98c41fc9ad4",
  "node_modules/@babel/types/lib/validators/isSpecifierDefault.js": "db7aa4126961faae630f403eeef141303433b2876f211e03c225eb42bfbbfeb2",
  "node_modules/@babel/types/lib/validators/isType.js": "989abd2b9fd3d8eccd07747ce1b02b00394072772c5b9d9e6e0c7a06350ae181",
  "node_modules/@babel/types/lib/validators/isValidES3Identifier.js": "3b140e2e1f8196b5512e39482ca86816e935f5da044a2bf98592f54c6aeb3243",
  "node_modules/@babel/types/lib/validators/isValidIdentifier.js": "bd3786c08dfc34a4c3d7a91dead2eb4b5019feff9b9b5142be239dc131540b18",
  "node_modules/@babel/types/lib/validators/isVar.js": "90543c9b06bff6cb76a51bc683ae4a157be17894c207e9990c2392c14414810c",
  "node_modules/@babel/types/lib/validators/matchesPattern.js": "faa0f46205a18caed21f64bfd188ddec38385ec4e0434d4a6b60416cd3121347",
  "node_modules/@babel/types/lib/validators/react/isCompatTag.js": "7e84ca002aa1b6a2f32c789fdffd270fe09cfcf77d6cb0e3a6293abc9b49f764",
  "node_modules/@babel/types/lib/validators/react/isReactComponent.js": "281f08ec2c69731afd438f59f338230ee86e1cc763227ddc4a9685cbc0ad8e7e",
  "node_modules/@babel/types/lib/validators/validate.js": "33812a6c26391ae424b121032b6c8817b2165bb03c368f0751d9e54c62031092",
  "node_modules/@babel/types/package.json": "f32460a35cc4649d81f10d4bc6dcfa1ade7a47f95df5db4bb4483f34d24b476e",
  "node_modules/@jridgewell/gen-mapping/dist/gen-mapping.umd.js": "1d501e1cc3755fbc9a1b12a8722fc87930c71b15e1d21a664ddfa4fed0d5fad7",
  "node_modules/@jridgewell/gen-mapping/package.json": "6264fca78382a9782f8e8d5e653e7bf43dc8aa6d469f3322a82e531093896a01",
  "node_modules/@jridgewell/resolve-uri/dist/resolve-uri.umd.js": "2d46a62531a9ffa1e6e04995a94ae35d7a10869e2116132068a8755a15d46663",
  "node_modules/@jridgewell/resolve-uri/package.json": "0793e722ffe08f3b4f1862c4dc96d920a62d6811a3648b4feb02f06c63227e8b",
  "node_modules/@jridgewell/sourcemap-codec/dist/sourcemap-codec.umd.js": "36f67483c3beef15e041483b68e1b66e8b6b3e6c50ab654a5e97464082324cc9",
  "node_modules/@jridgewell/sourcemap-codec/package.json": "ac7afd57294dbee1f891ca797e19e405340f2cd6031808e6d3845fec60a5b43f",
  "node_modules/@jridgewell/trace-mapping/dist/trace-mapping.umd.js": "5ad4ec0709f78aa806c70965d4c162270e1df605f5572aa3a1ced31fe73dd07a",
  "node_modules/@jridgewell/trace-mapping/package.json": "7f5eacc669d36013f9b792ab15721a97d48b26b093100122aa6c8691ebe656be",
  "node_modules/baseline-browser-mapping/dist/index.cjs": "e4e9963623aee5876ac0a708788326810f3ff972fe2c89272d46d8ae5e1bdf39",
  "node_modules/baseline-browser-mapping/package.json": "5aa0f5010239dd299632eaa426e040b418834bdc412f33376c2ef95958769d36",
  "node_modules/browserslist/error.js": "31a088cef26edc246ab9aecf33e12d59a5abf90d8afec7846b66ab80f7cd26d4",
  "node_modules/browserslist/index.js": "91c1c52679849e64a42daa7794a4b46db13a98e21c7bde518420f33e9d3c939f",
  "node_modules/browserslist/node.js": "e2aea99b99a125bcaa08e9389d9c18d72d12272451187471c8878dd5a27b1406",
  "node_modules/browserslist/package.json": "837c596bf1bbcabec84142e5d746e7dcd1dc39e7d23bbc9655cc85af1add21d1",
  "node_modules/browserslist/parse.js": "70ed6c75be22a1dbe292fd61a6ac50ee8d8862c2e10aa879b8ce6e458e807c06",
  "node_modules/caniuse-lite/data/agents.js": "a938f78e5f2bb5f25aafb3a1b0454a5854ee3f4e4e4bb791b74703fb3234f95f",
  "node_modules/caniuse-lite/data/browserVersions.js": "042cb7ad4dd6cf87413c43b98449374feeece659fd91abcde88fc7587b02bde7",
  "node_modules/caniuse-lite/data/browsers.js": "63c5f20e38bbeef5d28f0af686170bb9ee1438819c96583a6af621c4b1ec0edf",
  "node_modules/caniuse-lite/data/versionGroups.js": "4fb0fae8b1e7400a904d4ff5a4e6b82904334edba83d40c11f254be75710986e",
  "node_modules/caniuse-lite/dist/lib/statuses.js": "8844a0427a503f9b1c7a6b9b5278ef704b9a07ac5ffa4b0bd07b54ecda9b7967",
  "node_modules/caniuse-lite/dist/lib/supported.js": "29f8eb9e9c0092159154dfdb80b6c49f290ea8ec587272c2fda47c8181759950",
  "node_modules/caniuse-lite/dist/unpacker/agents.js": "6c62eb14bb8653e3a80fb0aea9d38462f68b0711346a3fd92eee7e9edff069fe",
  "node_modules/caniuse-lite/dist/unpacker/browserVersions.js": "21fb3fc52b70bb44091d82e55f74f8e93ffe6ab5608654af64da7964b4acc455",
  "node_modules/caniuse-lite/dist/unpacker/browsers.js": "b8775f01de6ff801a56db3478b5e3794debf222a7d73239f20d37589f9cc968b",
  "node_modules/caniuse-lite/dist/unpacker/feature.js": "ad8356e1b547922d8ea315b3ded883091af334bc6b458c96d2c87099fe86b468",
  "node_modules/caniuse-lite/dist/unpacker/region.js": "4c74a2e70fc257b49a84bab4420d431fc430fa9294cbff59159f8c35b50e972a",
  "node_modules/caniuse-lite/dist/unpacker/versionGroups.js": "778bb3f2cf9f689f36abfc8579b303b6d60a51b00e2932892d492985dbd05d9b",
  "node_modules/caniuse-lite/package.json": "c40fe84462acdbd5f9541f5d9dad68f401692d9e24393c89fa0a567cedcfa78e",
  "node_modules/debug/package.json": "ea8e33d63fe5f3a4c36609b6c3df8e2ef1f8b8ba2fc3a2e1e53cb27291f384af",
  "node_modules/debug/src/common.js": "dbe83d2bb5837f3c4d7fe537b8004c585987270eceed5b06b8e078deb0ae214a",
  "node_modules/debug/src/index.js": "aa127ff1752b7d9c7415c5c7bb6994d9aa722b81bcbcab4bd48316b013d23bf3",
  "node_modules/debug/src/node.js": "d7b26d7c92f8ea7794b77ce11f3c11cd18c9084df7c357e3c7025344fa28aac6",
  "node_modules/electron-to-chromium/package.json": "47b07a98ea2bf8a050de8f89e435ea2932af0047a2f6e1c0c28190e8a60462df",
  "node_modules/electron-to-chromium/versions.js": "6058ec67479c7f068647c235d59c6481ee550d70d8fcd9bbf57811755b40869c",
  "node_modules/gensync/index.js": "09e82a13eb50d14b42acdfd1db8fbde8f17e99527aa1bd5a489094e9a48a855a",
  "node_modules/gensync/package.json": "80cddca71baa1ba0cf44f65585e1c1ed7576abdb759ed391007925c961ca6334",
  "node_modules/js-tokens/index.js": "b6f81c0531fc09be2f8a26059a5cb9f47150e550471da0ace5705a26d3c6268e",
  "node_modules/js-tokens/package.json": "47345931827b3e26db9fe690abb81f856a0d040cbca8af1e69711a64cd58ce0d",
  "node_modules/jsesc/jsesc.js": "03c367cbd13dc753bb8fc6c8ec3a01078c3ee142ee3f747c0490d311bc80a3b3",
  "node_modules/jsesc/package.json": "6127ab2ccfbf576671dcfedcf2a8d97c9bbb3e5e4cff1274b3210b86a97a287c",
  "node_modules/lru-cache/index.js": "f527d2386a6266b9bf67d264194948cf741b12daa19fea19e3537414ee31f9a7",
  "node_modules/lru-cache/package.json": "f5a3379f52a453412f5d8551bf11fa0bef4316cc88645c9d190a017e1c58a4c2",
  "node_modules/ms/index.js": "e5f0b6a946a9b2b356a28557728410717df54ea2f599edb619f9839df6b7b0e9",
  "node_modules/ms/package.json": "1a6b4d9739790c0b94ab96c8cc0507e281c164c311ff4fbf5e57fb8d26290b40",
  "node_modules/node-releases/data/processed/envs.json": "35ac15c8389cb8355dc6646b0340a53b2f87eb9ebd64985b3f4642e8685e4aa4",
  "node_modules/node-releases/data/release-schedule/release-schedule.json": "1cf0432ceb9dfde7f1fd4cce43206519942cfdfad5a26039c2f4bb20fde8549c",
  "node_modules/node-releases/package.json": "5e02800f3f3dfee2e6f794dc2a6a1fca4e0fed80e4c689bb312a7140b2c93896",
  "node_modules/picocolors/package.json": "ef2ac226c4811d312e12c64214c453878653e834482125ae475f27cea60de737",
  "node_modules/picocolors/picocolors.js": "213bb870fcaad4def0215fe34fbb0f529836cc4d2462e02f14f1a49d09781625",
  "node_modules/semver/package.json": "aa906c5bf8a2fa68683cae07d18553ae2538ed0d5a567911980b2ef25ee8b9ba",
  "node_modules/semver/semver.js": "d89ed53251e85463bf4300ae9a3e258dc75eb73eb2820d524bd05f4451bed3d4",
  "node_modules/yallist/iterator.js": "d02451fa396de7f9ec93cc6fb3b07aaa7be637acb3409a9ddebd1c2de9279c1a",
  "node_modules/yallist/package.json": "27699a6415a43f128c0e8ddcd5bf6e265f6cf3a581a9d959c11b977244fadc34",
  "node_modules/yallist/yallist.js": "a2518b63469953a0fd13f3c738f50a1b2ce084374e9af0af7d7209ee1b0e8e55"
};

async function workspaceRoot(projectRoot){
 const root=path.resolve(projectRoot);
 if(await realpath(root)!==root||!(await lstat(root)).isDirectory())throw Error('Workspace root must be a real directory');
 return root;
}
async function boundedFile(root,file,limit=SOURCE_LIMIT,identities){
 const relative=path.relative(root,file);
 if(!relative||relative.startsWith('..'+path.sep)||relative==='..'||path.isAbsolute(relative))throw Error('Compiler input outside workspace');
 let current=root;
 for(const part of relative.split(path.sep)) {current=path.join(current,part);if((await lstat(current)).isSymbolicLink())throw Error('Compiler input symlink denied');}
 if(await realpath(file)!==file)throw Error('Compiler input outside workspace');
 const handle=await open(file,constants.O_RDONLY|constants.O_NOFOLLOW);
 try {const before=await handle.stat();if(!before.isFile()||before.size>limit)throw Error('Compiler input budget exceeded');const bytes=await handle.readFile();const after=await handle.stat();const identity=JSON.stringify([after.dev,after.ino,after.size,after.mtimeMs,after.ctimeMs]);if(identities){if(identities.has(file)&&identities.get(file)!==identity)throw Error('Compiler input identity changed');identities.set(file,identity);}if(bytes.length>limit||before.size!==after.size||before.mtimeMs!==after.mtimeMs||before.ctimeMs!==after.ctimeMs)throw Error('Compiler input changed while reading');return bytes;}finally{await handle.close();}
}
// Execute a private per-build CommonJS closure from the verified byte snapshot.
// Native Node resolution is used only to locate a candidate; no workspace module
// is executed unless that exact resolved file belongs to the pinned snapshot.
function snapshotTools(root,sources){
 const cache=new Map(),builtin=new Set(builtinModules.map(name=>name.replace(/^node:/,'')));
 const nativeRequire=createRequire(path.join(root,'package.json'));
 function resolve(specifier,importer){
  if(typeof specifier!=='string')throw Error('Tool module specifier denied');
  if(builtin.has(specifier.replace(/^node:/,'')))return specifier;
  const resolver=createRequire(importer);
  if(!specifier.startsWith('.')&&!path.isAbsolute(specifier)){
   const parts=specifier.split('/'),name=specifier.startsWith('@')?parts.slice(0,2).join('/'):parts[0];
   for(const lookup of resolver.resolve.paths(specifier)||[]){
    const candidate=path.join(lookup,name);let present=false;try{lstatSync(candidate);present=true;}catch(e){if(e.code!=='ENOENT'&&e.code!=='ENOTDIR')throw e;}
    if(present){if(!sources.has(path.join(candidate,'package.json')))throw Error('Tool resolution outside pinned graph');break;}
   }
  }
  const resolved=resolver.resolve(specifier);
  if(!sources.has(resolved))throw Error('Tool resolution outside pinned graph');
  return resolved;
 }
 function load(specifier,importer){
  const file=resolve(specifier,importer);
  if(builtin.has(file.replace(/^node:/,'')))return nativeRequire(file);
  if(cache.has(file))return cache.get(file).exports;
  const module={exports:{},filename:file,id:file,loaded:false};cache.set(file,module);
  if(file.endsWith('.json')){module.exports=JSON.parse(sources.get(file).toString('utf8'));module.loaded=true;return module.exports;}
  if(!/\.(?:js|cjs)$/.test(file))throw Error('Tool executable type denied');
  const require=request=>load(request,file);require.resolve=request=>resolve(request,file);
  require.cache=Object.create(null);require.extensions=Object.create(null);module.require=require;
  const compiled=new Script('(function(exports,require,module,__filename,__dirname){\n'+sources.get(file).toString('utf8')+'\n})',{filename:file});
  compiled.runInThisContext()(module.exports,require,module,file,path.dirname(file));module.loaded=true;return module.exports;
 }
 return specifier=>load(specifier,path.join(root,'package.json'));
}
async function acquireTrust(root){
 if(process.env.ESBUILD_BINARY_PATH!==undefined)throw Error('ESBUILD_BINARY_PATH override denied');
 if(process.platform!=='linux'||process.arch!=='x64')throw Error('Unpinned compiler platform');
 const records=[],identities=new Map(),toolSources=new Map();
 async function record(file,pin,limit){const bytes=await boundedFile(root,path.join(root,file),limit,identities),digest=sha(bytes);if(pin&&digest!==pin)throw Error('Owned compiler recipe or tool differs: '+file);records.push({file,digest,bytes:bytes.length});return bytes;}
 const self=await record("src/first-read/build-profile.mjs");
 if(sha(self.toString('utf8').replace(/const BUILDER_PIN = '[a-f0-9]+';/,"const BUILDER_PIN = 'BUILDER_HASH';"))!==BUILDER_PIN)throw Error('Owned builder differs');
 for(const [file,pin] of Object.entries(RECIPE_PINS))await record(file,pin);
 for(const [file,pin] of Object.entries(TOOL_PINS))toolSources.set(path.join(root,file),await record(file,pin));
 await record('package-lock.json');await record('package.json');
 for(const name of ['react','react-dom','scheduler','@tanstack/query-core'])await record('node_modules/'+name+'/package.json');
 const apiFile='node_modules/esbuild/lib/main.js',binaryFile='node_modules/@esbuild/linux-x64/bin/esbuild';
 await record(apiFile,API_PIN);await record(binaryFile,BINARY_PIN,16*1024*1024);
 const compilerPackage=JSON.parse((await record('node_modules/esbuild/package.json')).toString('utf8'));
 if(compilerPackage.version!=='0.25.12')throw Error('Compiler version differs');
 await record('node_modules/@esbuild/linux-x64/package.json');
 const require=createRequire(path.join(root,'package.json'));
 const compilerRequire=createRequire(path.join(root,apiFile));
 for(const lookup of compilerRequire.resolve.paths('@esbuild/linux-x64/bin/esbuild')||[]){
  if(lookup===path.join(root,'node_modules'))break;
  try{lstatSync(path.join(lookup,'@esbuild/linux-x64'));throw Error('Native compiler resolution outside pinned path');}catch(e){if(e.code!=='ENOENT'&&e.code!=='ENOTDIR')throw e;}
 }
 if(compilerRequire.resolve('@esbuild/linux-x64/bin/esbuild')!==path.join(root,binaryFile))throw Error('Native compiler resolution outside pinned path');
 if(require.resolve('esbuild')!==path.join(root,apiFile))throw Error('Compiler resolution outside workspace');
 for(const tool of ['@babel/core','@babel/plugin-transform-react-jsx'])if(require.resolve(tool)!==path.join(root,'node_modules',tool,'lib/index.js'))throw Error('JSX compiler resolution outside pinned path');
 const loadTool=snapshotTools(root,toolSources),babel=loadTool('@babel/core'),jsx=loadTool('@babel/plugin-transform-react-jsx');
 const jsxTransform=(ast,text)=>babel.transformFromAstSync(ast,text,{configFile:false,babelrc:false,ast:true,code:false,cloneInputAst:false,plugins:[[jsx,{runtime:'classic',pragma:'React.createElement',pragmaFrag:'React.Fragment',useSpread:true,throwIfNamespace:false}]]}).ast;
 const api=require('esbuild');if(api.version!=='0.25.12')throw Error('Loaded compiler version differs');
 return {api,jsxTransform,identities,files:records.sort((a,b)=>a.file.localeCompare(b.file)),apiFile,binaryFile};
}
async function confirmFiles(root,records,identities){
 for(const record of records){const b=await boundedFile(root,path.join(root,record.file),record.file.endsWith('/bin/esbuild')?16*1024*1024:SOURCE_LIMIT,identities);if(sha(b)!==record.digest||b.length!==record.bytes)throw Error('Compiler input changed during compilation');}
}
export async function buildFirstReadProfile({projectRoot=defaultRoot}={}){
 const root=await workspaceRoot(projectRoot),trust=await acquireTrust(root),build=trust.api.build;

 let inputBytes=0,stageBytes=0;
 const inputs=new Map(),runtime=root+"/src/engine/observer.mjs",ledger=root+"/src/first-read/query-ledger.mjs";
 const options={bundle:true,write:false,metafile:true,preserveSymlinks:true,platform:'browser',format:'iife',target:'chrome153',define:{'process.env.NODE_ENV':'"development"'},jsx:'transform',jsxFactory:'React.createElement',jsxFragment:'React.Fragment',sourcemap:false,minify:false,legalComments:'inline',charset:'utf8',tsconfigRaw:{}};
 const loader={name:'stateatom-owned-first-read-inputs',setup(b){
  b.onResolve({filter:/^(?:stateatom:first-read-query-ledger|\/@stateatom\/first-read-query)$/},()=>({path:ledger}));
  b.onResolve({filter:/^\/@stateatom\/runtime$/},()=>({path:runtime}));
  b.onLoad({filter:/\.[cm]?[jt]sx?$/},async({path:file})=>{
   const source=(await boundedFile(root,file,SOURCE_LIMIT,trust.identities)).toString('utf8'),relative=path.relative(root,file).split(path.sep).join('/');let code=source,transform='identity',siteCounts;
   inputBytes+=Buffer.byteLength(source);if(inputBytes>SOURCE_LIMIT||inputs.size>=160)throw Error('Compiler source budget exceeded');
   if(file===runtime){code=instrumentReadReceipts(source,{ledgerURL:'stateatom:first-read-query-ledger'})+`\nexport const __sa=createObserver(window,{sourceConsumption:true,fetchInitiators:true,reactStateHandoffs:true,sourceWrites:true,queryHandoffs:true,queryCallCensus:true});__sa.enableReactHostProbe(${JSON.stringify({status:'Observed',adapter:'react18-final-host-props/1',versions:{react:'18.3.1','react-dom':'18.3.1'},sources:vendorHashes})});`;transform='observer-read-receipts';}
   else if(relative.startsWith("tests/fixtures/inspection/")){const r=instrumentScript(source,relative,{reactHostProps:true,reactStateHandoffs:true,sourceConsumption:true,sourceWrites:true,jsxTransform:trust.jsxTransform});if(r.skipped)throw Error('Owned profile source transform skipped: '+relative);siteCounts={boundaries:r.unsupported};code=r.code;if(relative.endsWith('/react/App.tsx')){const region=instrumentReadRegion(source,relative,code);if(region.status!=='Code-linked')throw Error('Original first-read source changed');code=region.code;}transform='owned-source';}
   else{const reactFile=relative.replace(/^node_modules\//,'');if(vendorHashes[reactFile]){const r=transformReactVendor(source,reactFile,{reactStateHandoffs:true,firstReadContracts:true});code=r.code;siteCounts=r.firstReadCounts||r.counts;transform='react-first-read';}
    else if(relative.startsWith('node_modules/@tanstack/query-core/build/modern/')){const name=path.basename(file);if(firstQueryHashes[name]){let base=source;if(['queryClient.js','queryCache.js','query.js'].includes(name))base=transformQueryVendor(source,'@tanstack/query-core/build/modern/'+name,{queryCallCensus:true}).code;const r=transformFirstQuery(source,name,{transformedSource:base});code=r.code;siteCounts=r.counts;transform='query-first-read';}}
   }
   stageBytes+=Buffer.byteLength(code);if(stageBytes>SOURCE_LIMIT)throw Error('Compiler stage budget exceeded');
   inputs.set(relative,{file:relative,sourceDigest:sha(source),sourceBytes:Buffer.byteLength(source),stageDigest:sha(code),stageBytes:Buffer.byteLength(code),transform,...(siteCounts?{siteCounts}:{})});
   return{contents:code,loader:/\.tsx?$/.test(file)?'tsx':'jsx',resolveDir:path.dirname(file)};
  });
 }};
 const output=await build({...options,absWorkingDir:root,entryPoints:["tests/fixtures/inspection/react/App.tsx"],plugins:[loader],logLevel:'silent'}),code=output.outputFiles[0].text,bytes=Buffer.byteLength(code);
 if(bytes>2*1024*1024)throw Error('Closed profile bundle exceeds existing 2 MiB source budget');
 const external=Object.values(output.metafile.outputs).flatMap(o=>o.imports).filter(i=>i.external);if(external.length)throw Error('Closed profile has external imports');
 for(const input of Object.keys(output.metafile.inputs))if(!inputs.has(input.replaceAll('\\','/')))throw Error('Unrecorded compiler input: '+input);
 if([...inputs.values()].reduce((n,i)=>n+i.sourceBytes,0)>SOURCE_LIMIT||[...inputs.values()].reduce((n,i)=>n+i.stageBytes,0)>SOURCE_LIMIT)throw Error('Compiler sources exceed existing 2 MiB source budget');
 await confirmFiles(root,trust.files,trust.identities);
 await confirmFiles(root,[...inputs.values()].map(i=>({file:i.file,digest:i.sourceDigest,bytes:i.sourceBytes})),trust.identities);
 const recipe={name:'stateatom-owned-first-read/2',builder:BUILDER_PIN,transforms:RECIPE_PINS,tools:{kind:"helper-owned-transform-dependency-files",digest:sha(JSON.stringify(TOOL_PINS)),files:Object.keys(TOOL_PINS).length}};
 const manifest={schema:1,id:randomUUID(),profile:'react18-query5-first-data-render/1',createdAt:new Date().toISOString(),bundle:{digest:sha(code),bytes},compiler:{name:'esbuild',version:trust.api.version,host:{node:process.versions.node,v8:process.versions.v8,platform:process.platform,arch:process.arch},entryPoints:["tests/fixtures/inspection/react/App.tsx"],api:{file:trust.apiFile,digest:API_PIN},binary:{file:trust.binaryFile,digest:BINARY_PIN},options,externalImports:external.length},trust:{recipe,files:trust.files},inputs:[...inputs.values()].sort((a,b)=>a.file.localeCompare(b.file)),scope:'Actual closed compilation input/stage/output bytes only; not complete browser graph, pristine realm, aliases/effects or a product certificate'};
 if(Buffer.byteLength(JSON.stringify(manifest))>256*1024)throw Error('Compiler metadata budget exceeded');
 manifest.digest=sha(JSON.stringify(manifest));return{code,manifest,fullPath:false};
}
