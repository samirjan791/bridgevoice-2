import type {Language} from '../languages';
// These are user-request shortcuts, never canned assistant answers.
const starters:Record<Language,string[]>={
 en:['Help me translate something.','Help me understand a word or idea.'],
 ps:['له ما سره د یوه متن په ژباړلو کې مرسته وکړه.','د یوې کلمې یا مفکورې په پوهېدو کې راسره مرسته وکړه.'],
 'fa-AF':['در ترجمه یک متن به من کمک کن.','در فهمیدن یک واژه یا مفهوم به من کمک کن.'],
 'es-US':['Ayúdame a traducir un texto.','Ayúdame a entender una palabra o idea.'],
};
const assistantQuestion=/^(?:(?:what|which)\s+(?:would|do)\s+you\s+(?:like|want|need)|(?:do|would)\s+you\s+(?:need|want|like)|(?:how|what)\s+can\s+i\s+help|(?:can|may|shall)\s+i\s+(?:help|explain|translate)|tell\s+me\s+what\s+you\s+(?:need|want))/i;
export function userFollowUps(items:readonly string[],language:Language='en'):string[]{
 const unique=[...new Set(items.map(s=>s.trim()).filter(Boolean))];
 const valid=unique.filter(s=>s.length<=250&&!assistantQuestion.test(s));
 // Replace a wholly reversed-perspective set, including old stored results.
 return (valid.length?valid:unique.length?starters[language]:[]).slice(0,3);
}
