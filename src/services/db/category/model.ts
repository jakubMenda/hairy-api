import {Document, model, Model, Schema} from 'mongoose';

export interface CategoryModel extends Document {
    name?: string;
}

export const CategorySchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 80,
    },
});

export const Category: Model<CategoryModel> = model<CategoryModel>('Category', CategorySchema);
