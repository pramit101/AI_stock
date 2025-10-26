// src/analysisService.ts
import { db } from "./firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Save a single AI analysis result
export const saveAnalysis = async (analysisResult: any) => {
  try {
    const docRef = await addDoc(collection(db, "shelfAnalysis"), analysisResult);
    console.log("AI analysis saved with ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error saving analysis:", error);
    throw error;
  }
};

// Fetch all AI analysis results
export const getAnalyses = async () => {
  try {
    const snapshot = await getDocs(collection(db, "shelfAnalysis"));
    const results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return results;
  } catch (error) {
    console.error("Error fetching analyses:", error);
    throw error;
  }
};
