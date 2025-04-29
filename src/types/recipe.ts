import { Timestamp } from "firebase/firestore";

export interface Recipe {
  title: string;
  description: string;
  ingredients: Array<{
    name: string;
    quantity: string;
    subStep: string;
  }>;
  instructions: Array<{
    step: string;
    subStep: string;
  }>;
  imageUrl?: string;
  userId: string;
  occasion: string;
  memories?: Array<{
    text: string;
    imageUrl?: string;
  }>;
  createdAt: Timestamp;
}
