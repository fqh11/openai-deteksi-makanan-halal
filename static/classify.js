async function uploadFile() {
    const uploadButton = document.querySelector("button");
    const overallPredictionDiv = document.getElementById("overallPrediction");
    const loadingSpinner = document.getElementById("loadingSpinner");
    const classificationOutput = document.getElementById("classificationOutput");
    const predictionText = document.getElementById("predictionText");
    const haramIngredientsList = document.getElementById("haramIngredientsList")

    if (!window.selectedFile) {
        alert("No file selected!");
        return;
    }

    // Disable button while processing
    uploadButton.disabled = true;
    uploadButton.classList.add("opacity-50", "cursor-not-allowed");

    // Show overall prediction & loading animation
    overallPredictionDiv.classList.remove("hidden");
    loadingSpinner.classList.remove("hidden");
    classificationOutput.innerHTML = ""; // Clear previous classifications


    const formData = new FormData();
    formData.append("file", window.selectedFile);

    try {
        const response = await fetch("/upload", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        console.log("Upload Success:", result);

        if (result.url) {
            // Display uploaded image immediately
            // document.getElementById("imageContainer").innerHTML = `<img src="${result.url}" class="w-64 rounded-lg shadow-md">`;

            // Wait for classification
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Hide loading animation
            loadingSpinner.classList.add("hidden");

            let isHalal = true;
            let haramIngredients = [];

            // Ensure classifications exist in response
            if (result.json && result.json.classifications) {
                result.json.classifications.forEach(classification => {
                    console.log("Processing classification:", classification); // Debugging line

                    let colorClass = classification.prediction === "Halal" ? "bg-green-200" :
                        classification.prediction === "Haram" ? "bg-red-200" :
                            "bg-yellow-200"; // Doubtful

                    classificationOutput.innerHTML += `
                        <div class="p-4 border border-gray-300 rounded-lg ${colorClass} shadow-sm">
                            <p class="font-semibold text-gray-800">Ingredient: ${classification.ingredient}</p>
                            <p class="text-sm text-gray-600">Prediction: <span class="font-bold">${classification.prediction}</span> (${classification.confidence}%)</p>
                            <p class="text-sm text-gray-500">${classification.explanation}</p>
                        </div>
                    `;

                    if (classification.prediction === "Haram") {
                        isHalal = false;
                        haramIngredients.push(classification.ingredient);
                    }
                });

                // Show classification results
                classificationOutput.parentElement.classList.remove("hidden");

                // Update overall prediction
                if (isHalal) {
                    overallPredictionDiv.classList.remove("bg-red-500");
                    overallPredictionDiv.classList.add("bg-green-500");
                    predictionText.textContent = "This product is Halal .";
                    haramIngredientsList.innerHTML = "";
                } else {
                    overallPredictionDiv.classList.remove("bg-green-500");
                    overallPredictionDiv.classList.add("bg-red-500");
                    predictionText.textContent = "This product is Haram due to the following ingredients:";
                    haramIngredientsList.innerHTML = haramIngredients.map(ingredient => `<li>${ingredient}</li>`).join("");
                }
            } else {
                console.error("No classifications found in response.");
                classificationOutput.innerHTML = "<p class='text-gray-600'>No classification data available.</p>";
            }
        } else {
            alert("File upload failed.");
        }
    } catch (error) {
        console.error("Upload Failed:", error);
    } finally {
        // Re-enable button
        uploadButton.disabled = false;
        uploadButton.classList.remove("opacity-50", "cursor-not-allowed");
    }
}

// Attach upload function to a button
// document.getElementById("uploadBtn").addEventListener("click", uploadFile);
