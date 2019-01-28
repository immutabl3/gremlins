import clicker from './species/clicker';
import pointer from './species/pointer';
import toucher from './species/toucher';
import formFiller from './species/formFiller';
import scroller from './species/scroller';
import typer from './species/typer';

import alert from './mogwais/alert';
import fps from './mogwais/fps';
import gizmo from './mogwais/gizmo';

import allTogether from './strategies/allTogether';
import bySpecies from './strategies/bySpecies';
import distribution from './strategies/distribution';

export default {
	species: {
		clicker,
		pointer,
		toucher,
		formFiller,
		scroller,
		typer,
	},
	mogwais: {
		alert,
		fps,
		gizmo,
	},
	strategies: {
		allTogether,
		bySpecies,
		distribution,
	},
};