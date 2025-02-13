import openai
import json
import base64

# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode("utf-8")

def extracted_prompt():
    return f'''
    Extract the text from image
    
    Extract text Rules:
    - Translate the text into english only
    - Ignore non-ingredient words like brand names, locations, etc.
    - do not make assumption
    - make it briefly clear
    '''

def extracted_text(file_path):
    prompt = extracted_prompt()
    base64_image = encode_image(file_path)

    # Call the OpenAI API
    completion = openai.chat.completions.create(   
        model="gpt-4o",
        messages=[
            {"role": "user", 
                "content": [
                {
                    "type" : "text",
                    "text" : prompt,
                },
                {
                    "type": "image_url", 
                    "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"},
                }
                ]
            }
        ]
    )

    # Debugging: Print the raw response
    # print("Raw API Response:", completion)
    extract_result = completion.choices[0].message.content
    return str(extract_result)

def get_function_schema():
    functions = [
        {
            "name": "classify_ingredients",
            "description": "Classify ingredients as Halal, Haram, or Doubtful based on Islamic dietary laws.",
            "parameters": {
                "type": "object",
                "properties": {
                    "classifications": {
                        "type": "array",
                        "items": {
                            "type": "object",
                            "properties": {
                                "ingredient": {"type": "string"},
                                "prediction": {"type": "string"},
                                "confidence": {"type": "integer"},
                                "explanation": {"type": "string"}
                            }
                        }
                    }
                }
            }
        }
    ]
    return functions

def classification_prompt(text):
    return f"""
    Classify the following ingredients based on Islamic dietary laws (Halal, Haram, or Doubtful):
    
    Classification Rules:
    - Ensure consistent output formatting.
    - Classify each ingredient strictly based on Islamic dietary laws.
    - If uncertain, leave it blank and do not make assumptions.
    - Provide a confidence percentage (0-100) for each classification.
    - If the classification is "Doubtful," provide an explanation for why the ingredient’s status is unclear, such as ambiguity about the origin or processing method.
    - Provide brief, clear explanations for each classification and confidence percentage.
    - Classify ingredients only. Ignore other words like country, factory, company, etc

    Output Format:
    {{
        "classifications": [
            {{
                "ingredient": "<Ingredient>",
                "prediction": "Halal/Haram/Doubtful",
                "confidence": <Confidence Score>,
                "explanation": "<Explanation>"
            }},
            ...
        ]
    }}
    
    Ingredient List:
    {text}
    """

def generate_classification(text):
    prompt = classification_prompt(text)
    functions = get_function_schema()

    # Call the OpenAI API
    completion = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a islamic dietary classification assistant."},
            {"role": "user", "content": prompt}
        ],
        functions=functions,
        temperature=0.2
    )

    # Debugging: Print the raw classification response
    # print("Raw Classification Response:", completion)

    # Extract classification results
    try:
        classification_text = completion.choices[0].message.function_call.arguments
        # print("Classification Arguments:", classification_text)  # Debugging
        return json.loads(classification_text)
    except Exception as e:
        print(f"Error processing classification: {e}")
        return None
