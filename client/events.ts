import { onRegisterNUI } from '../../../[Framework]/arp-lib/global/client/components/utils';
import { QuarryEntered, Mine, QuarryLeft, RefreshPool, RemoveNodeObject, OpenFurnace, OpenExchange, Exchange } from './main';

on('polyzone:enter', QuarryEntered);
on('polyzone:exit', QuarryLeft);
on('arp-mining:smelter', OpenFurnace);
on('arp-mining:OpenExchange', OpenExchange);
on('arp-mining:Exchange', Exchange);
onNet('arp-mining:mine', Mine);
onNet('arp-mining:refresh', RefreshPool);
onNet('arp-mining:removenodeobject', RemoveNodeObject);
