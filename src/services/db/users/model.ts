import { Document, model, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Toto je typ typescriptu - typová kontrola přímo v kódu.
// Kdybychom jí odstranili, nic moc se neděje, typescript je jen pro nás.
// Otazník znamená, že nejsou povinné. Ve skutečnosti jsou, ale validace na fieldy probíhá až později
export interface UserModel extends Document {
  email?: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  isSpecialist?: boolean;
  practiceFrom?: string;
  specializations?: string[];
  workingFromMinutes?: number;
  workToMinutes?: number;
  workingDays?: number[];
  generateAuthToken?: () => string;
  getPublicProfile?: () => UserModel;
}

// Schémata vytváří knihovna mongoose a při ukládání kontroluje, jestli data odpovídají tomuto schématu (něco je pravidlo, něco transformace - viz trim)
// v opačném případě vyhodí výjimku. Čili mongoose = validace před vkládáním do db.
// ... Výše jde o typescript a tady v zásadě o javascript a definici v mongoose (javascriptová knihovna), proto
// typescript typy jsou psané lowercase (string, number, string[]), zatímco tady jsou konstruktory js typů
// (String, Number, Array,...)
export const UserSchema: Schema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 80,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxLength: 80,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    maxLength: 80,
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
  },
  practiceFrom: {
    type: String,
    required: false,
  },
  specializations: {
    type: Array,
    required: false,
  },
  workingFromMinutes: {
    type: Number,
    required: false,
  },
  workingToMinutes: {
    type: Number,
    required: false,
  },
  workingDays: {
    type: Array,
    required: false,
  },
  workingAtSalonId: {
    type: String,
    required: false,
  },
  isSpecialist: {
    type: Boolean,
    required: true,
  },
});

// Definice funkcí prováděných před / po nějaké akci na modelu
// tady hashujeme heslo
UserSchema.pre('save', async function(next: NextFunction) {
  const user: UserModel = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }

  next();
});

// Definice metod na instanci modelu
UserSchema.methods.generateAuthToken = async function() {
  const user: UserModel = this;

  return jwt.sign({
      _id: user._id.toString(),
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '14 days',
    });
};

UserSchema.methods.getPublicProfile = async function() {
  const user: UserModel = this;

  const { password, ...rest } = user.toObject();
  return rest;
};

// Model je to, kde se děje všechna mongoose sranda.
// Představte si to klidně jako kolekci v mongu s jasně danou strukturou - definovanou výše schématem.
// Tady "vytváříme" tu kolekci - když potom udělám instanci tohohle Usera,
// stačí na té instanci zavolat save() a tím máme nový záznam v db.
export const User: Model<UserModel> = model<UserModel>('User', UserSchema);
