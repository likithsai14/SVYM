document.addEventListener('DOMContentLoaded', function() {
    const signupForm = document.getElementById('signupForm');
    const messageDiv = document.getElementById('message');
    const generatedUserIdDiv = document.getElementById('generatedUserId');

    // Form fields
    const dobInput = document.getElementById('dob');
    const ageInput = document.getElementById('age');
    const districtSelect = document.getElementById('districtName');
    const talukSelect = document.getElementById('talukName');
    const caste = document.getElementById('caste');
    const referralSource = document.getElementById('referralSource');
    const staffNameDiv = document.getElementById('staffNameDiv');
    const staffNameInput = document.getElementById('staffName');
    const mobiliserSelect = document.getElementById('mobiliserName'); // dropdown
    const mobiliserNameText = document.getElementById('mobiliserNameText');

    mobiliserSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        mobiliserNameText.value = selectedOption ? selectedOption.text : '';
    });


    // Error message spans
    const errorSpans = {
        candidateName: document.getElementById('candidateNameError'),
        fatherHusbandName: document.getElementById('fatherHusbandNameError'),
        districtName: document.getElementById('districtNameError'),
        talukName: document.getElementById('talukNameError'),
        villageName: document.getElementById('villageNameError'),
        dob: document.getElementById('dobError'),
        age: document.getElementById('ageError'),
        familyMembers: document.getElementById('familyMembersError'),
        qualification: document.getElementById('qualificationError'),
        caste: document.getElementById('casteError'),
        referralSource: document.getElementById('referralSourceError'),
        gender: document.getElementById('genderError'),
        tribal: document.getElementById('tribalError'),
        pwd: document.getElementById('pwdError'),
        aadharNumber: document.getElementById('aadharNumberError'),
        candidatePhone: document.getElementById('candidatePhoneError'),
        parentPhone: document.getElementById('parentPhoneError'),
        mobiliserName: document.getElementById('mobiliserNameError'),
        supportedProject: document.getElementById('supportedProjectError'),
        email: document.getElementById('emailError')
    };

    // Populate districts (Full list for Karnataka)
    const districts = [
        "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
        "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
        "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan",
        "Haveri", "Kalaburagi (Gulbarga)", "Kodagu", "Kolar", "Koppal",
        "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga (Shimoga)",
        "Tumakuru", "Udupi", "Uttara Kannada (Karwar)", "Vijayapura (Bijapur)", "Yadgir"
    ].sort();

    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });

    // Populate taluks per district
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
        "Mandya": ["Krishnarajapet", "Maddur", "Malavalli", "Mandya", "Nagamangala", "Pandavapura", "Srirangapatna", "Maddur"],
        "Mysuru": ["Mysuru", "Hunsur", "Nanjangud", "T. Narasipur", "Krishnarajanagara", "Piriyapatna", "Saragur"],
        "Raichur": ["Devadurga", "Lingsugur", "Manvi", "Raichur", "Sindhanur", "Maski", "Sirwar"],
        "Ramanagara": ["Channapattana", "Kanakapura", "Magadi", "Ramanagara"],
        "Shivamogga (Shimoga)": ["Bhadravati", "Hosanagara", "Sagar", "Shikaripur", "Shivamogga", "Sorab", "Thirthahalli"],
        "Tumakuru": ["Chiknayakanahalli", "Gubbi", "Koratagere", "Kunigal", "Madhugiri", "Pavagada", "Sira", "Tiptur", "Tumakuru", "Turuvekere"],
        "Udupi": ["Brahmavar", "Byndoor", "Karkala", "Kaup", "Kundapura", "Udupi", "Hebri"],
        "Uttara Kannada (Karwar)": ["Ankola", "Bhatkal", "Haliyal", "Honnavar", "Joida", "Karwar", "Kumta", "Mundgod", "Siddapur", "Sirsi", "Yellapur"],
        "Vijayapura (Bijapur)": ["Basavana Bagewadi", "Bijapur (Vijayapura)", "Indi", "Muddebihal", "Sindagi", "Kolhar", "Tikota"],
        "Yadgir": ["Gurumitkal", "Shahapur", "Shorapur", "Vadagera", "Yadgir", "Gurumitkal"]
    };

    // District -> Taluk
    districtSelect.addEventListener('change', function() {
        const selectedDistrict = this.value;
        talukSelect.innerHTML = '<option value="">Select Taluk</option>';
        talukSelect.disabled = true;
        if (selectedDistrict && districtTaluks[selectedDistrict]) {
            const taluksForDistrict = districtTaluks[selectedDistrict].sort();
            taluksForDistrict.forEach(taluk => {
                const option = document.createElement('option');
                option.value = taluk;
                option.textContent = taluk;
                talukSelect.appendChild(option);
            });
            talukSelect.disabled = false;
        }
        clearError(districtSelect);
        clearError(talukSelect);
    });

    // Load Mobilisers
    loadFieldMobilisers();

    referralSource.addEventListener('change', function() {
        if (this.value === 'SVYM Staff') {
            staffNameDiv.style.display = 'block';
            staffNameInput.setAttribute('required', 'required');
        } else {
            staffNameDiv.style.display = 'none';
            staffNameInput.removeAttribute('required');
            staffNameInput.value = '';
        }
        clearError(referralSource);
    });

    dobInput.addEventListener('change', function() {
        const dob = new Date(this.value);
        if (isNaN(dob)) {
            ageInput.value = '';
            showError(dobInput, 'Please enter a valid date.');
            return;
        }
        clearError(dobInput);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        ageInput.value = age;
        if (age < 17 || age > 50) showError(ageInput, 'Applicant must be at least 17 years old and not greater than 50.');
        else clearError(ageInput);
    });

    caste.addEventListener('change', function() { clearError(caste); });

    function showError(inputElement, message) {
        const errorSpan = errorSpans[inputElement.id];
        if (errorSpan) { errorSpan.textContent = message; inputElement.classList.add('input-error'); }
    }

    function clearError(inputElement) {
        const errorSpan = errorSpans[inputElement.id];
        if (errorSpan) { errorSpan.textContent = ''; inputElement.classList.remove('input-error'); }
    }

    // Live validation
    signupForm.querySelectorAll('input, select').forEach(input => {
        if(input.hasAttribute('required')){
            input.addEventListener('input',()=>{ if(this.value.trim()!=='') clearError(input); });
            input.addEventListener('blur',()=>{ if(this.value.trim()==='') showError(input,'This field is required.'); else clearError(input); });
        }
        if(input.hasAttribute('pattern')){
            input.addEventListener('input',()=>{ if(!input.validity.valid) showError(input,input.title||'Invalid format.'); else clearError(input); });
            input.addEventListener('blur',()=>{ if(!input.validity.valid && input.value.trim()!=='') showError(input,input.title||'Invalid format.'); else clearError(input); });
        }
    });

    signupForm.addEventListener('submit', async function(event){
        event.preventDefault();

        messageDiv.style.display='none';
        generatedUserIdDiv.style.display='none';
        messageDiv.className='';
        Object.values(errorSpans).forEach(span=>{if(span) span.textContent='';});
        signupForm.querySelectorAll('.input-error').forEach(el=>el.classList.remove('input-error'));

        let isValid=true;
        const formData=new FormData(signupForm);
        const data={};
        for(let [key,value] of formData.entries()){ data[key]=value.trim(); }

        // Revalidate fields
        signupForm.querySelectorAll('input, select').forEach(input=>{
            if(input.hasAttribute('required') && input.value.trim()===''){ showError(input,'This field is required.'); isValid=false; }
            else if(input.hasAttribute('pattern') && input.value.trim()!=='' && !input.validity.valid){ showError(input,input.title||'Invalid format.'); isValid=false; }
            else clearError(input);
        });

        if(parseInt(ageInput.value)<17 || parseInt(ageInput.value)>50){ showError(ageInput,'Applicant must be at least 17 years old and not greater than 50.'); isValid=false; }
        if(districtSelect.value===''){ showError(districtSelect,'Please select a district.'); isValid=false; }
        if(talukSelect.value===''){ showError(talukSelect,'Please select a taluk.'); isValid=false; }
        if(caste.value===''){ showError(caste,'Please select a caste.'); isValid=false; }
        if(mobiliserSelect.value===''){ showError(mobiliserSelect,'Please select a mobiliser.'); isValid=false; }
        if(referralSource.value===''){ showError(referralSource,'Please select referralSource'); isValid=false; }

        if(!isValid){ showMessage('error','Please correct the errors in the form.'); return; }

        try{
            const response = await fetch('/.netlify/functions/signup',{
                method:'POST',
                headers:{ 'Content-Type':'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if(response.ok){
                showMessage('success', result.message||'Sign up successful!');
                generatedUserIdDiv.innerHTML=`Your User ID: <strong>${result.userId}</strong><br>Please remember this ID for login.`;
                generatedUserIdDiv.style.display='block';
                signupForm.reset();
                ageInput.value='';
                talukSelect.innerHTML='<option value="">Select Taluk</option>';
                talukSelect.disabled=true;
                let v=document.getElementById('adminapprovalMessage');
                v.style.display='block';
                v.className='message success';
                v.textContent='Your request has been sent for admin approval. You will be notified once approved.';
            } else {
                showMessage('error', result.message||'Sign up failed. Please try again.');
            }
        } catch(error){
            console.error('Error during sign up:',error);
            showMessage('error','An unexpected error occurred. Please try again later.');
        }
    });

    function showMessage(type,text){
        messageDiv.textContent=text;
        messageDiv.className='';
        messageDiv.classList.add('message',type);
        messageDiv.style.display='block';
    }

    async function loadFieldMobilisers(){
        try{
            const response = await fetch('/.netlify/functions/getFieldMobileData');
            const result = await response.json();

            if(response.ok && Array.isArray(result.fieldMobilisers)){
                mobiliserSelect.innerHTML = '<option value="">Select Mobiliser</option>';
                result.fieldMobilisers.forEach(m=>{
                    const option=document.createElement('option');
                    option.value = m.userId;
                    option.textContent = m.FieldMobiliserName;
                    mobiliserSelect.appendChild(option);
                });
            } else {
                mobiliserSelect.innerHTML = '<option value="">No mobilisers available</option>';
                console.error('Failed to load mobilisers:', result);
            }
        } catch(error){
            console.error('Error fetching mobilisers:',error);
            mobiliserSelect.innerHTML = '<option value="">Error loading mobilisers</option>';
        }
    }
});
