// Global variable to store the fetched student data, including _id and _rev
let fetchedStudentData = null;

// Data structures for dropdowns (your existing code is fine, no changes needed here)
const districts = [
    "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
    "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
    "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
    "Haveri", "Kalaburagi (Gulbarga)", "Kodagu", "Kolar", "Koppal",
    "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga (Shimoga)",
    "Tumakuru", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir"
].sort();

const districtTaluks = {
    "Bagalkot": ["Badami", "Bagalkot", "Bilgi", "Hungund", "Jamkhandi", "Mudhol", "Rabkavi Banhatti"],
    "Ballari": ["Ballari", "Hospet (Vijayanagara)", "Kudligi", "Sandur", "Siruguppa", "Kampli", "Hagaribommanahalli", "Kotturu", "Kurugodu", "Hoovina Hadagali"],
    "Belagavi": ["Athani", "Bailhongal", "Belagavi", "Chikodi", "Gokak", "Hukkeri", "Khanapur", "Raibag", "Ramdurg", "Saundatti", "Kagwad", "Mudalagi", "Nippani"],
    "Bengaluru Rural": ["Devanahalli", "Doddaballapur", "Hosakote", "Nelamangala", "Vijayapura"],
    "Bengaluru Urban": ["Bengaluru North", "Bengaluru South", "Bengaluru East", "Anekal", "Yelahanka", "Kengeri"],
    "Bidar": ["Aurad", "Basavakalyan", "Bhalki", "Bidar", "Humnabad", "Kamalanagar", "Chitguppa"],
    "Chamarajanagar": ["Chamarajanagar", "Gundlupet", "Kollegal", "Yelandur", "Hanur"],
    "Chikkaballapur": ["Bagepalli", "Chikkaballapur", "Gauribidanur", "Gudibanda", "Sidlaghatta", "Chintamani"],
    "Chikkamagaluru": ["Chikkamagaluru", "Kadur", "Koppa", "Mudigere", "Narasimharajapura", "Sringeri", "Tarikere"],
    "Chitradurga": ["Chitradurga", "Challakere", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
    "Dakshina Kannada": ["Bantwal", "Belthangady", "Mangaluru", "Puttur", "Sullia", "Kadaba", "Mulki", "Moodabidri"],
    "Davanagere": ["Channagiri", "Davanagere", "Harihar", "Honnali", "Jagalur", "Nyamathi"],
    "Dharwad": ["Annigeri", "Dharwad", "Hubballi", "Kalghatgi", "Kundgol", "Navalgund", "Alnavar"],
    "Gadag": ["Gadag", "Gajendragad", "Laxmeshwar", "Mundargi", "Nargund", "Ron", "Shirhatti"],
    "Hassan": ["Alur", "Arkalgud", "Arsikere", "Belur", "Channarayapattana", "Hassan", "Holenarasipur", "Sakleshpur"],
    "Haveri": ["Byadgi", "Hanagal", "Haveri", "Hirekerur", "Ranebennur", "Savnur", "Shiggaon"],
    "Kalaburagi (Gulbarga)": ["Afzalpur", "Aland", "Chincholi", "Chittapur", "Kalaburagi", "Jevargi", "Sedam", "Kamalapur", "Shahabad", "Yadrami"],
    "Kodagu": ["Madikeri", "Somvarpet", "Virajpet"],
    "Kolar": ["Bangarapet", "Kolar", "Malur", "Mulbagal", "Srinivaspur"],
    "Koppal": ["Gangavati", "Koppal", "Kushtagi", "Yelburga", "Kanakagiri", "Karatagi"],
    "Mandya": ["Krishnarajapet", "Maddur", "Malavalli", "Mandya", "Nagamangala", "Pandavapura", "Srirangapatna"],
    "Mysuru": ["Mysuru", "Hunsur", "Nanjangud", "T. Narasipur", "Krishnarajanagara", "Piriyapatna", "Saragur"],
    "Raichur": ["Devadurga", "Lingsugur", "Manvi", "Raichur", "Sindhanur", "Maski", "Sirwar"],
    "Ramanagara": ["Channapattana", "Kanakapura", "Magadi", "Ramanagara"],
    "Shivamogga (Shimoga)": ["Bhadravati", "Hosanagara", "Sagar", "Shikaripur", "Shivamogga", "Sorab", "Thirthahalli"],
    "Tumakuru": ["Chiknayakanahalli", "Gubbi", "Koratagere", "Kunigal", "Madhugiri", "Pavagada", "Sira", "Tiptur", "Tumakuru", "Turuvekere"],
    "Udupi": ["Brahmavar", "Byndoor", "Karkala", "Kaup", "Kundapura", "Udupi", "Hebri"],
    "Uttara Kannada (Karwar)": ["Ankola", "Bhatkal", "Haliyal", "Honnavar", "Joida", "Karwar", "Kumta", "Mundgod", "Siddapur", "Sirsi", "Yellapur"],
    "Vijayapura (Bijapur)": ["Basavana Bagewadi", "Bijapur (Vijayapura)", "Indi", "Muddebihal", "Sindagi", "Kolhar", "Tikota"],
    "Yadgir": ["Gurumitkal", "Shahapur", "Shorapur", "Vadagera", "Yadgir"]
};

// Fixed options for other dropdowns
const casteOptions = ["OBC", "SC", "ST", "Minority", "Others"];
const genderOptions = ["Male", "Female", "Other"];
const tribalOptions = ["Yes", "No"];
const pwdOptions = ["Yes", "No"];


// Helper function to get query parameters from the URL
const getQueryParam = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};

// Function to calculate age from a date of birth
function calculateAge(dob) {
    const dobDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDifference = today.getMonth() - dobDate.getMonth();
    if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dobDate.getDate())) {
        age--;
    }
    return age;
}

// Function to populate a dropdown from an array
function populateDropdown(dropdownElement, options, selectedValue) {
    dropdownElement.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    const labelText = dropdownElement.id.replace('Name', '').replace(/([A-Z])/g, ' $1').trim();
    defaultOption.textContent = `Select ${labelText}`;
    dropdownElement.appendChild(defaultOption);

    options.forEach(option => {
        const newOption = document.createElement('option');
        newOption.value = option;
        newOption.textContent = option;
        if (option === selectedValue) {
            newOption.selected = true;
        }
        dropdownElement.appendChild(newOption);
    });
}

// Function to populate the taluk dropdown based on the selected district
function populateTalukDropdown(district, selectedTaluk = '') {
    const talukDropdown = document.getElementById('talukName');
    const taluks = districtTaluks[district] || [];

    talukDropdown.innerHTML = '';
    talukDropdown.disabled = true;

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select Taluk';
    talukDropdown.appendChild(defaultOption);

    if (taluks.length > 0) {
        talukDropdown.disabled = false;
        taluks.forEach(taluk => {
            const newOption = document.createElement('option');
            newOption.value = taluk;
            newOption.textContent = taluk;
            if (taluk === selectedTaluk) {
                newOption.selected = true;
            }
            talukDropdown.appendChild(newOption);
        });
    }
}

// Function to validate a single input field
function validateField(input) {
    const errorElement = document.getElementById(input.id + 'Error');
    errorElement.textContent = '';
    let isValid = true;

    if (input.hasAttribute('required') && !input.value.trim()) {
        errorElement.textContent = 'This field is required.';
        isValid = false;
    } else {
        if (input.id === 'aadharNumber' && !/^\d{12}$/.test(input.value)) {
            errorElement.textContent = 'Aadhar number must be 12 digits.';
            isValid = false;
        }
        if (input.id === 'candidatePhone' && !/^\d{10}$/.test(input.value)) {
            errorElement.textContent = 'Phone number must be 10 digits.';
            isValid = false;
        }
        if (input.id === 'parentPhone' && !/^\d{10}$/.test(input.value)) {
            errorElement.textContent = 'Phone number must be 10 digits.';
            isValid = false;
        }
        if (input.id === 'email' && input.value.trim() !== '' && !input.value.includes('@')) {
            errorElement.textContent = 'Please enter a valid email address.';
            isValid = false;
        }
    }
    return isValid;
}

// Function to validate the entire form (used on submission)
function validateForm() {
    let isValid = true;
    const form = document.getElementById('signupForm');
    const requiredInputs = form.querySelectorAll('input[required], select[required]');

    requiredInputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    return isValid;
}


// Main function to fetch student data and populate the form
async function fetchStudentData(studentId) {
    if (!studentId) {
        console.error('Student ID not found in URL.');
        document.getElementById('message').textContent = 'Error: Student ID not found.';
        document.getElementById('message').style.display = 'block';
        return;
    }

    const backendEndpoint = `/.netlify/functions/studentfetchone?id=${studentId}`;

    try {
        const response = await fetch(backendEndpoint, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to fetch student data: ${errorData.message}`);
        }

        const student = await response.json();
        console.log('Fetched student data:', student);

        // Store the fetched student data, including _id and _rev
        fetchedStudentData = student;

        // Populate form fields
        document.getElementById('candidateName').value = student.candidateName || '';
        document.getElementById('fatherHusbandName').value = student.fatherHusbandName || '';
        document.getElementById('villageName').value = student.villageName || '';
        document.getElementById('dob').value = student.dob || '';
        if (student.dob) {
            document.getElementById('age').value = calculateAge(student.dob);
        }
        document.getElementById('familyMembers').value = student.familyMembers || '';
        document.getElementById('qualification').value = student.qualification || '';
        document.getElementById('aadharNumber').value = student.aadharNumber || '';
        document.getElementById('candidatePhone').value = student.candidatePhone || '';
        document.getElementById('parentPhone').value = student.parentPhone || '';
        document.getElementById('mobiliserName').value = student.mobiliserName || '';
        document.getElementById('supportedProject').value = student.supportedProject || '';
        document.getElementById('email').value = student.email || '';

        // Handle the dropdowns
        const studentDistrict = student.districtName;
        const studentTaluk = student.talukName;
        
        populateDropdown(document.getElementById('districtName'), districts, studentDistrict);
        populateTalukDropdown(studentDistrict, studentTaluk);
        populateDropdown(document.getElementById('caste'), casteOptions, student.caste);
        populateDropdown(document.getElementById('gender'), genderOptions, student.gender);
        populateDropdown(document.getElementById('tribal'), tribalOptions, student.tribal);
        populateDropdown(document.getElementById('pwd'), pwdOptions, student.pwd);

    } catch (error) {
        console.error('Error fetching student data:', error);
        document.getElementById('message').textContent = `Error: ${error.message}`;
        document.getElementById('message').style.display = 'block';
    }
}

// Event listener for the District dropdown to handle dynamic Taluk population
document.getElementById('districtName').addEventListener('change', (event) => {
    const selectedDistrict = event.target.value;
    populateTalukDropdown(selectedDistrict);
    validateField(event.target);
});

// Event listener for DOB input to automatically calculate age and validate
document.getElementById('dob').addEventListener('change', (event) => {
    const dob = event.target.value;
    if (dob) {
        document.getElementById('age').value = calculateAge(dob);
    } else {
        document.getElementById('age').value = '';
    }
    validateField(event.target);
});

// Attach live validation to all form inputs and selects
window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('signupForm');
    const formFields = form.querySelectorAll('input, select');
    formFields.forEach(field => {
        field.addEventListener(field.tagName === 'SELECT' || field.type === 'date' ? 'change' : 'input', (event) => {
            validateField(event.target);
        });
    });

    const studentId = getQueryParam('studentId');
    fetchStudentData(studentId);
});

// Event listener for form submission
document.getElementById('signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    if (validateForm()) {
        const messageElement = document.getElementById('message');
        
        if (!fetchedStudentData || !fetchedStudentData._id || !fetchedStudentData._rev) {
            messageElement.textContent = 'Error: Student data is not fully loaded. Cannot update.';
            messageElement.style.display = 'block';
            messageElement.style.color = 'red';
            return;
        }

        const form = event.target;
        const formData = new FormData(form);

        // Best practice: Create a copy of the fetched data and then update it with new form values
        const updatedStudentData = { ...fetchedStudentData };
        
        for (const [key, value] of formData.entries()) {
            updatedStudentData[key] = value;
        }
        
        // No need to manually add password, etc., as it's already in fetchedStudentData
        console.log('Form is valid. Data to be submitted:', updatedStudentData);

        const backendEndpoint = `/.netlify/functions/studentupdateone`;

        try {
            const response = await fetch(backendEndpoint, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedStudentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to update student data: ${errorData.message}`);
            }
            
            const successData = await response.json();
            
            console.log('Student data updated successfully.');
            
            // Update the global fetchedStudentData with the new revision number from the success response
            fetchedStudentData._rev = successData.rev;

            messageElement.textContent = 'Form Updated successfully!';
            messageElement.style.display = 'block';
            messageElement.style.color = 'green';
        } catch (error) {
            console.error('Error updating student data:', error);
            messageElement.textContent = `Error: ${error.message}`;
            messageElement.style.display = 'block';
            messageElement.style.color = 'red';
        }
    } else {
        console.log('Form has validation errors.');
        const messageElement = document.getElementById('message');
        messageElement.textContent = 'Please correct the errors in the form.';
        messageElement.style.display = 'block';
        messageElement.style.color = 'red';
    }
});