import {Document, model, Model, Schema} from 'mongoose';

// Toto je typ typescriptu - typová kontrola přímo v kódu.
// Kdybychom jí odstranili, nic moc se neděje, typescript je jen pro nás.
// Otazník znamená, že nejsou povinné. Ve skutečnosti jsou, ale validace na fieldy probíhá až později
export interface CategoryModel extends Document {
    name?: string;
}

// Schémata vytváří knihovna mongoose a při ukládání kontroluje, jestli data odpovídají tomuto schématu (něco je pravidlo, něco transformace - viz trim)
// v opačném případě vyhodí výjimku. Čili mongoose = validace před vkládáním do db.
// ... Výše jde o typescript a tady v zásadě o javascript a definici v mongoose (javascriptová knihovna), proto
// typescript typy jsou psané lowercase (string, number, string[]), zatímco tady jsou konstruktory js typů
// (String, Number, Array,...)
export const CategorySchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 80,
    },
});

// Model je to, kde se děje všechna mongoose sranda.
// Představte si to klidně jako kolekci v mongu s jasně danou strukturou - definovanou výše schématem.
// Tady "vytváříme" tu kolekci - když potom udělám instanci tohohle Usera,
// stačí na té instanci zavolat save() a tím máme nový záznam v db.
export const Category: Model<CategoryModel> = model<CategoryModel>('Category', CategorySchema);
