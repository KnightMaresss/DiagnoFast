export const getDiagnosis = async (symptoms) => {
    try {
      const response = await fetch("http://127.0.0.1:8001/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to fetch");
      }
  
      return await response.json();
    } catch (error) {
      console.error("API Fetch Error:", error);
      throw error;
    }
  };
  