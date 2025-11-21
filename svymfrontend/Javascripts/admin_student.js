document.addEventListener('DOMContentLoaded', async function () {
    // ------------------------------
    // Element References
    // ------------------------------
    const studentForm = document.getElementById('studentForm');
    const messageDiv = document.getElementById('message');
    const approvalMessageDiv = document.getElementById('adminapprovalMessage');
    const generatedUserIdDiv = document.getElementById('generatedUserId');
    const dobInput = document.getElementById('dob');
    const ageInput = document.getElementById('age');
    const districtSelect = document.getElementById('districtName');
    const talukSelect = document.getElementById('talukName');
    const casteSelect = document.getElementById('caste');
    const referralSource = document.getElementById('referralSource');
    const staffNameDiv = document.getElementById('staffNameDiv');
    const staffNameInput = document.getElementById('staffName');
    const mobiliserSelect = document.getElementById('mobiliserName'); // dropdown
    const mobiliserNameText = document.getElementById('mobiliserNameText');
    const qualificationSelect = document.getElementById('qualification');
    const otherQualificationInput = document.getElementById('otherQualification');
    const otherQualificationLabel = document.querySelector('label[for="otherQualification"]');
    const otherCasteInput = document.getElementById('otherCaste');
    const otherCasteLabel = document.querySelector('label[for="otherCaste"]');
    const otherTribalInput = document.getElementById('otherTribal');
    const otherTribalLabel = document.querySelector('label[for="otherTribal"]');
    const otherPwdInput = document.getElementById('otherPwd');
    const otherPwdLabel = document.querySelector('label[for="otherPwd"]');

    const addStudentsBtn = document.getElementById('addStudentsBtn');
    const viewRequestsBtn = document.getElementById('viewRequestsBtn');
    const requestsBadge = document.getElementById('requestsCount'); // badge for pending requests

    const studentTableBody = document.getElementById('studentTableBody');
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const statusFilter = document.getElementById('statusFilter');

    // Function to convert to title case
    function toTitleCase(str) {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    }

    const viewModal = document.getElementById('viewModal');
    const viewModalBody = document.getElementById('studentDetailsTable');

    const requestsModal = document.getElementById('requestsModal');
    const requestsTableBody = document.getElementById('requestsTable').querySelector('tbody');

    const studentFormModal = document.getElementById('studentFormModal');

    // Title case conversion and input restriction for candidate name and father/husband name
    const candidateNameInput = document.getElementById('candidateName');
    const fatherHusbandNameInput = document.getElementById('fatherHusbandName');

    if (candidateNameInput) {
        candidateNameInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
            this.value = toTitleCase(this.value);
        });
    }

    if (fatherHusbandNameInput) {
        fatherHusbandNameInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
            this.value = toTitleCase(this.value);
        });
    }

    // Input restriction for village name
    const villageNameInput = document.getElementById('villageName');
    if (villageNameInput) {
        villageNameInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
            this.value = toTitleCase(this.value);
        });
    }

    // Input restriction for staff name (alphabets and spaces, title case)
    if (staffNameInput) {
        staffNameInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
            this.value = toTitleCase(this.value);
        });
    }

    // Input restriction for Aadhaar number (only digits)
    const aadharNumberInput = document.getElementById('aadharNumber');
    if (aadharNumberInput) {
        aadharNumberInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, ''); // restrict to digits only
        });
    }

    // Input restriction for phone numbers (only digits)
    const candidatePhoneInput = document.getElementById('candidatePhone');
    if (candidatePhoneInput) {
        candidatePhoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, ''); // restrict to digits only
        });
    }

    const parentPhoneInput = document.getElementById('parentPhone');
    if (parentPhoneInput) {
        parentPhoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, ''); // restrict to digits only
        });
    }

    mobiliserSelect.addEventListener('change', function() {
        const selectedOption = this.options[this.selectedIndex];
        mobiliserNameText.value = selectedOption ? selectedOption.text : '';
    });

    referralSource.addEventListener('change', function() {
        if (this.value === 'SVYM Staff') {
            staffNameDiv.style.display = 'flex';
            staffNameInput.setAttribute('required', 'required');
        } else {
            staffNameDiv.style.display = 'none';
            staffNameInput.removeAttribute('required');
            staffNameInput.value = '';
        }
        clearError(referralSource);
    });

    qualificationSelect.addEventListener('change', function() {
        if (this.value === 'Other') {
            otherQualificationLabel.style.display = 'block';
            otherQualificationInput.style.display = 'block';
            otherQualificationInput.setAttribute('required', 'required');
        } else {
            otherQualificationLabel.style.display = 'none';
            otherQualificationInput.style.display = 'none';
            otherQualificationInput.removeAttribute('required');
            otherQualificationInput.value = '';
        }
        clearError(qualificationSelect);
        clearError(otherQualificationInput);
    });

    // Restrict otherQualification to alphabets and spaces only
    if (otherQualificationInput) {
        otherQualificationInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
            this.value = toTitleCase(this.value);
        });
    }

    // Restrict otherTribal to alphabets and spaces only
    if (otherTribalInput) {
        otherTribalInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
            this.value = toTitleCase(this.value);
        });
    }

    // Restrict otherPwd to alphabets and spaces only
    if (otherPwdInput) {
        otherPwdInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^a-zA-Z\s]/g, ''); // restrict to alphabets and spaces
            this.value = toTitleCase(this.value);
        });
    }

    // ------------------------------
    // Error handling spans
    // ------------------------------
    const errorSpans = {};
    studentForm.querySelectorAll('input, select').forEach(input => {
        const spanId = input.id + 'Error';
        errorSpans[input.id] = document.getElementById(spanId);
    });
    errorSpans['otherQualification'] = document.getElementById('otherQualificationError');
    errorSpans['otherCaste'] = document.getElementById('otherCasteError');
    errorSpans['otherTribal'] = document.getElementById('otherTribalError');
    errorSpans['otherPwd'] = document.getElementById('otherPwdError');

    // Live validation
    studentForm.querySelectorAll('input, select').forEach(input => {
        if(input.hasAttribute('required')){
            input.addEventListener('input',()=>{ if(input.value.trim()!=='') clearError(input); });
            input.addEventListener('blur',()=>{ if(input.value.trim()==='') showError(input,'This field is required.'); else clearError(input); });
        }
        if(input.hasAttribute('pattern') || input.type === 'date' || input.type === 'email'){
            input.addEventListener('input',()=>{ if(!input.validity.valid) showError(input,input.title||'Invalid format.'); else clearError(input); });
            input.addEventListener('blur',()=>{ if(!input.validity.valid && input.value.trim()!=='') showError(input,input.title||'Invalid format.'); else clearError(input); });
        }
        // Specific validation for name fields (only alphabets and spaces)
        if(input.id === 'candidateName' || input.id === 'fatherHusbandName'){
            input.addEventListener('input',()=>{ if(input.value.trim()!=='' && /[^a-zA-Z\s]/.test(input.value)) showError(input,'Only alphabets and spaces allowed.'); else clearError(input); });
            input.addEventListener('blur',()=>{ if(input.value.trim()!=='' && /[^a-zA-Z\s]/.test(input.value)) showError(input,'Only alphabets and spaces allowed.'); else clearError(input); });
        }
        // Specific validation for other fields (only alphabets and spaces)
        if(input.id === 'otherTribal' || input.id === 'otherPwd' || input.id === 'otherCaste' || input.id === 'otherQualification'){
            input.addEventListener('input',()=>{ if(input.value.trim()!=='' && /[^a-zA-Z\s]/.test(input.value)) showError(input,'Only alphabets and spaces allowed.'); else clearError(input); });
            input.addEventListener('blur',()=>{ if(input.value.trim()!=='' && /[^a-zA-Z\s]/.test(input.value)) showError(input,'Only alphabets and spaces allowed.'); else clearError(input); });
        }
        // Specific validation for mobile (only digits, 10 digits)
        if(input.id === 'candidatePhone' || input.id === 'parentPhone'){
            input.addEventListener('input',()=>{ if(input.value.trim()!=='' && !/^\d{10}$/.test(input.value)) showError(input,'Mobile number must be exactly 10 digits.'); else clearError(input); });
            input.addEventListener('blur',()=>{ if(input.value.trim()!=='' && !/^\d{10}$/.test(input.value)) showError(input,'Mobile number must be exactly 10 digits.'); else clearError(input); });
        }
    });

    function showError(input, message) {
        const span = errorSpans[input.id];
        if (span) {
            span.textContent = message;
            input.classList.add('input-error');
        }
    }

    function clearError(input) {
        const span = errorSpans[input.id];
        if (span) {
            span.textContent = '';
            input.classList.remove('input-error');
        }
    }

    function showMessage(type, text) {
        messageDiv.textContent = text;
        messageDiv.className = '';
        messageDiv.classList.add('message', type);
        messageDiv.style.display = 'block';
        setTimeout(() => { messageDiv.style.display = 'none'; }, 4000);
    }

    function showApprovalMessage(type, text) {
        approvalMessageDiv.textContent = text;
        approvalMessageDiv.className = '';
        approvalMessageDiv.classList.add('message', type);
        approvalMessageDiv.style.display = 'block';
        setTimeout(() => { approvalMessageDiv.style.display = 'none'; }, 4000);
    }

    // ------------------------------
    // Districts & Taluks
    // ------------------------------
    const districts = [
        "Bagalkot","Ballari","Belagavi","Bengaluru Rural","Bengaluru Urban",
        "Bidar","Chamarajanagar","Chikkaballapur","Chikkamagaluru","Chitradurga",
        "Dakshina Kannada","Davanagere","Dharwad","Gadag","Hassan",
        "Haveri","Kalaburagi (Gulbarga)","Kodagu","Kolar","Koppal",
        "Mandya","Mysuru","Raichur","Ramanagara","Shivamogga (Shimoga)",
        "Tumakuru","Udupi","Uttara Kannada (Karwar)","Vijayapura (Bijapur)","Yadgir"
    ].sort();

    districts.forEach(district => {
        const option = document.createElement('option');
        option.value = district;
        option.textContent = district;
        districtSelect.appendChild(option);
    });

    const districtTaluks = {
        "Bagalkot": ["Badami","Bagalkot","Bilgi","Hungund","Jamkhandi","Mudhol","Rabkavi Banhatti"],
        "Ballari":["Ballari","Hospet (Vijayanagara)","Kudligi","Sandur","Siruguppa","Kampli","Hagaribommanahalli","Kotturu","Kurugodu","Hoovina Hadagali"],
        "Belagavi":["Athani","Bailhongal","Belagavi","Chikodi","Gokak","Hukkeri","Khanapur","Raibag","Ramdurg","Saundatti","Kagwad","Mudalagi","Nippani"],
        "Bengaluru Rural":["Devanahalli","Doddaballapur","Hosakote","Nelamangala","Vijayapura"],
        "Bengaluru Urban":["Bengaluru North","Bengaluru South","Bengaluru East","Anekal","Yelahanka","Kengeri"],
        "Bidar":["Aurad","Basavakalyan","Bhalki","Bidar","Humnabad","Kamalanagar","Chitguppa"],
        "Chamarajanagar":["Chamarajanagar","Gundlupet","Kollegal","Yelandur","Hanur"],
        "Chikkaballapur":["Bagepalli","Chikkaballapur","Gauribidanur","Gudibanda","Sidlaghatta","Chintamani"],
        "Chikkamagaluru":["Chikkamagaluru","Kadur","Koppa","Mudigere","Narasimharajapura","Sringeri","Tarikere"],
        "Chitradurga":["Chitradurga","Challakere","Hiriyur","Holalkere","Hosadurga","Molakalmuru"],
        "Dakshina Kannada":["Bantwal","Belthangady","Mangaluru","Puttur","Sullia","Kadaba","Mulki","Moodabidri"],
        "Davanagere":["Channagiri","Davanagere","Harihar","Honnali","Jagalur","Nyamathi"],
        "Dharwad":["Annigeri","Dharwad","Hubballi","Kalghatgi","Kundgol","Navalgund","Alnavar"],
        "Gadag":["Gadag","Gajendragad","Laxmeshwar","Mundargi","Nargund","Ron","Shirhatti"],
        "Hassan":["Alur","Arkalgud","Arsikere","Belur","Channarayapattana","Hassan","Holenarasipur","Sakleshpur"],
        "Haveri":["Byadgi","Hanagal","Haveri","Hirekerur","Ranebennur","Savnur","Shiggaon"],
        "Kalaburagi (Gulbarga)":["Afzalpur","Aland","Chincholi","Chittapur","Kalaburagi","Jevargi","Sedam","Kamalapur","Shahabad","Yadrami"],
        "Kodagu":["Madikeri","Somvarpet","Virajpet","Ponnampet","Kushalnagar"],
        "Kolar":["Bangarapet","Kolar","Malur","Mulbagal","Srinivaspur"],
        "Koppal":["Gangavati","Koppal","Kushtagi","Yelburga","Kanakagiri","Karatagi"],
        "Mandya":["Krishnarajapet","Maddur","Malavalli","Mandya","Nagamangala","Pandavapura","Srirangapatna","Maddur"],
        "Mysuru":["Mysuru","Hunsur","Nanjangud","T. Narasipur","Krishnarajanagara","Piriyapatna","Saragur","Heggadadevankote"],
        "Raichur":["Devadurga","Lingsugur","Manvi","Raichur","Sindhanur","Maski","Sirwar"],
        "Ramanagara":["Channapattana","Kanakapura","Magadi","Ramanagara"],
        "Shivamogga (Shimoga)":["Bhadravati","Hosanagara","Sagar","Shikaripur","Shivamogga","Sorab","Thirthahalli"],
        "Tumakuru":["Chiknayakanahalli","Gubbi","Koratagere","Kunigal","Madhugiri","Pavagada","Sira","Tiptur","Tumakuru","Turuvekere"],
        "Udupi":["Brahmavar","Byndoor","Karkala","Kaup","Kundapura","Udupi","Hebri"],
        "Uttara Kannada (Karwar)":["Ankola","Bhatkal","Haliyal","Honnavar","Joida","Karwar","Kumta","Mundgod","Siddapur","Sirsi","Yellapur"],
        "Vijayapura (Bijapur)":["Basavana Bagewadi","Bijapur (Vijayapura)","Indi","Muddebihal","Sindagi","Kolhar","Tikota"],
        "Yadgir":["Gurumitkal","Shahapur","Shorapur","Vadagera","Yadgir","Gurumitkal"]
    };

    districtSelect.addEventListener('change', function () {
        const selectedDistrict = this.value;
        talukSelect.innerHTML = '<option value="">Select Taluk</option>';
        talukSelect.disabled = true;
        if (selectedDistrict && districtTaluks[selectedDistrict]) {
            const taluks = districtTaluks[selectedDistrict].sort();
            taluks.forEach(t => {
                const option = document.createElement('option');
                option.value = t;
                option.textContent = t;
                talukSelect.appendChild(option);
            });
            talukSelect.disabled = false;
        }
        clearError(districtSelect);
        clearError(talukSelect);
    });

    casteSelect.addEventListener('change', function () {
        const tribalSelect = document.getElementById('tribal');
        if (this.value === 'ST') {
            tribalSelect.disabled = false;
            tribalSelect.required = true;
        } else {
            tribalSelect.disabled = true;
            tribalSelect.required = false;
            tribalSelect.value = '';
            // Hide otherTribal when tribal is disabled
            otherTribalLabel.style.display = 'none';
            otherTribalInput.style.display = 'none';
            otherTribalInput.removeAttribute('required');
            otherTribalInput.value = '';
        }
        if (this.value === 'Others') {
            otherCasteLabel.style.display = 'block';
            otherCasteInput.style.display = 'block';
            otherCasteInput.setAttribute('required', 'required');
        } else {
            otherCasteLabel.style.display = 'none';
            otherCasteInput.style.display = 'none';
            otherCasteInput.removeAttribute('required');
            otherCasteInput.value = '';
        }
        clearError(casteSelect);
        clearError(otherCasteInput);
    });

    const tribalSelect = document.getElementById('tribal');
    tribalSelect.addEventListener('change', function () {
        if (this.value === 'Others') {
            otherTribalLabel.style.display = 'block';
            otherTribalInput.style.display = 'block';
            otherTribalInput.setAttribute('required', 'required');
        } else {
            otherTribalLabel.style.display = 'none';
            otherTribalInput.style.display = 'none';
            otherTribalInput.removeAttribute('required');
            otherTribalInput.value = '';
        }
        clearError(tribalSelect);
        clearError(otherTribalInput);
    });

    const pwdSelect = document.getElementById('pwd');
    pwdSelect.addEventListener('change', function () {
        if (this.value === 'Others') {
            otherPwdLabel.style.display = 'block';
            otherPwdInput.style.display = 'block';
            otherPwdInput.setAttribute('required', 'required');
        } else {
            otherPwdLabel.style.display = 'none';
            otherPwdInput.style.display = 'none';
            otherPwdInput.removeAttribute('required');
            otherPwdInput.value = '';
        }
        clearError(pwdSelect);
        clearError(otherPwdInput);
    });

    // ------------------------------
    // DOB → Age
    // ------------------------------
    function calculateAge() {
        const dobValue = dobInput.value;
        const dob = new Date(dobValue);
        if (isNaN(dob) || dobValue === '') {
            ageInput.value = '';
            if (dobValue !== '') showError(dobInput, 'Please enter a valid date.');
            return;
        }
        clearError(dobInput);
        const today = new Date();
        let age = today.getFullYear() - dob.getFullYear();
        const m = today.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
        ageInput.value = age;
        if (age < 17 || age > 50) showError(dobInput, 'Applicant must be at least 17 years old and not greater than 50.');
        else clearError(dobInput);
    }

    dobInput.addEventListener('change', calculateAge);
    dobInput.addEventListener('blur', calculateAge);
    dobInput.addEventListener('input', calculateAge);

    // ------------------------------
    // Fetch & Render Students
    // ------------------------------
    let studentsData = [];
    let currentPage = 1;
    let totalPages = 1;
    const rowsPerPage = 7;

    async function fetchStudents() {
        try {
            const res = await fetch('/.netlify/functions/allstudents');
            const data = await res.json();
            studentsData = data.students.map(st => ({
                id: st._id.$oid || st._id,
                userId: st.userId,
                candidateName: st.candidateName,
                fatherHusbandName: st.fatherHusbandName,
                familyMembers: st.familyMembers,
                referralSource: st.referralSource,
                staffName: st.staffName,
                email: st.email,
                mobile: st.candidatePhone,
                parentPhone: st.parentPhone,
                aadharNumber: st.aadharNumber,
                gender: st.gender,
                caste: st.caste,
                dob: st.dob,
                age:  st.age,
                education: st.qualification,
                otherQualification: st.otherQualification,
                otherCaste: st.otherCaste,
                otherTribal: st.otherTribal,
                otherPwd: st.otherPwd,
                districtName: st.districtName,
                talukName: st.talukName,
                villageName: st.villageName,
                fieldMobiliserId: st.fieldMobiliserId,
                fieldMobiliserName: st.fieldMobiliserName,
                supportedProject: st.supportedProject,
                referralSource: st.referralSource,
                staffName: st.staffName,
                tribal: st.tribal,
                pwd: st.pwd,
                status: st.approvalStatus || "Active",
                enrollments: st.enrollments || [],
                creationDate: formatDate(st.createdAt)
            }));
            renderStudentsTable();
        } catch (err) {
            console.error("Error fetching students:", err);
            showMessage("error", "Failed to load student data.");
        }
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

    function getFilteredData() {
        const searchValue = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value.toLowerCase();
        return studentsData.filter(student => {
            const matchesSearch = student.candidateName.toLowerCase().includes(searchValue);
            const matchesStatus = statusValue === '' || student.status.toLowerCase() === statusValue;
            return matchesSearch && matchesStatus;
        });
    }

    function renderStudentsTable() {
        studentTableBody.innerHTML = "";
        const filtered = getFilteredData();

        totalPages = Math.ceil(filtered.length / rowsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedStudents = filtered.slice(start, end);

        if (paginatedStudents.length === 0) {
            studentTableBody.innerHTML = '<tr><td colspan="8">No students found.</td></tr>';
            updatePaginationInfo();
            return;
        }

        paginatedStudents.forEach(student => {
            const hasEnrollments = student.enrollments && student.enrollments.length > 0;
            const assignBtnDisabled = hasEnrollments ? 'disabled' : '';
            const assignBtnClass = hasEnrollments ? 'action-btn assign-btn disabled' : 'action-btn assign-btn';
            const payBtnDisabled = hasEnrollments ? '' : 'disabled';
            const payBtnClass = hasEnrollments ? 'action-btn paydues-btn' : 'action-btn paydues-btn disabled';
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${student.userId}</td>
                <td>${student.candidateName}</td>
                <td>${student.email || '-'}</td>
                <td><span class="status ${student.status}">${formatStatusDisplay(student.status)}</span></td>
                <td>
                    <button class="action-btn view-btn" data-id="${student.userId}"><i class="fas fa-eye"></i> View</button>
                    <button class="action-btn edit-btn" data-id="${student.userId}"><i class="fas fa-pen"></i> Edit</button>
                    <button class="${payBtnClass}" data-id="${student.userId}" ${payBtnDisabled}><i class="fas fa-credit-card"></i> Pay Dues</button>
                    <button class="${assignBtnClass}" data-id="${student.userId}" ${assignBtnDisabled}><i class="fas fa-plus"></i> Assign Course</button>
                </td>
            `;
            studentTableBody.appendChild(tr);
        });

        document.querySelectorAll('.view-btn').forEach(btn =>
            btn.addEventListener('click', () => openViewStudentModal(btn.dataset.id))
        );
        document.querySelectorAll('.edit-btn').forEach(btn =>
            btn.addEventListener('click', () => openAddEditStudentModal(btn.dataset.id))
        );
        document.querySelectorAll('.assign-btn').forEach(btn =>
            btn.addEventListener('click', () => openAssignCourseModal(btn.dataset.id))
        );
        document.querySelectorAll('.paydues-btn').forEach(btn =>
            btn.addEventListener('click', () => openAdminPayModal(btn.dataset.id))
        );

        updatePaginationInfo();
    }

    function updatePaginationInfo() {
        const filtered = getFilteredData();
        const total = Math.ceil(filtered.length / rowsPerPage) || 1;
        document.getElementById('paginationInfo').textContent = `Page ${currentPage} of ${total}`;

        // Disable/Enable Previous button
        const prevBtn = document.getElementById('prevPage');
        prevBtn.disabled = currentPage === 1;

        // Disable/Enable Next button
        const nextBtn = document.getElementById('nextPage');
        nextBtn.disabled = currentPage === total;
    }

    // ------------------------------
    // Add / Edit Student Modal
    // ------------------------------
    addStudentsBtn.addEventListener('click', () => {
        studentForm.reset();
        generatedUserIdDiv.textContent = '';
        document.getElementById('modalHeader').textContent = 'Add Student Data';
        document.getElementById('submitBtn').textContent = 'Add Student Data';
        studentFormModal.style.display = 'flex';
    });

    loadFieldMobilisers();

    async function openAddEditStudentModal(id) {
        const student = studentsData.find(s => s.userId === id);
        if (!student) return;
        studentFormModal.style.display = 'flex';
        document.getElementById('modalHeader').textContent = 'Edit Student Data';
        document.getElementById('submitBtn').textContent = 'Update Student Data';
        document.getElementById('candidateName').value = student.candidateName;
        document.getElementById('fatherHusbandName').value = student.fatherHusbandName;
        document.getElementById('email').value = student.email;
        document.getElementById('candidatePhone').value = student.mobile;
        document.getElementById('gender').value = student.gender;
        document.getElementById('dob').value = student.dob;
        document.getElementById('age').value = student.age;
        document.getElementById('qualification').value = student.education;
        document.getElementById('qualification').dispatchEvent(new Event('change'));
        document.getElementById('otherQualification').value = student.otherQualification;
        document.getElementById('villageName').value = student.villageName;
        document.getElementById('districtName').value = student.districtName;
        districtSelect.dispatchEvent(new Event('change'));
        document.getElementById('talukName').value = student.talukName;
        document.getElementById('caste').value = student.caste;
        document.getElementById('caste').dispatchEvent(new Event('change'));
        document.getElementById('otherCaste').value = student.otherCaste;
        document.getElementById('aadharNumber').value = student.aadharNumber;
        // Set tribal to default "Select Option" in edit mode
        document.getElementById('tribal').value = '';
        // Hide otherTribal by default in edit mode
        otherTribalLabel.style.display = 'none';
        otherTribalInput.style.display = 'none';
        otherTribalInput.removeAttribute('required');
        otherTribalInput.value = '';
        // Note: otherTribal value is not set, as tribal is reset
        document.getElementById('pwd').value = student.pwd;
        document.getElementById('pwd').dispatchEvent(new Event('change'));
        document.getElementById('otherPwd').value = student.otherPwd;
        document.getElementById('mobiliserName').value = student.fieldMobiliserId;
        document.getElementById('parentPhone').value = student.parentPhone;
        document.getElementById('familyMembers').value = student.familyMembers;
        document.getElementById('supportedProject').value = student.supportedProject;
        document.getElementById('referralSource').value = student.referralSource;
        document.getElementById('referralSource').dispatchEvent(new Event('change'));
        document.getElementById('staffName').value = student.staffName;

        generatedUserIdDiv.textContent = student.userId;
    }

    studentForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(studentForm);
        const studentObj = Object.fromEntries(formData.entries());

        // Special validation for qualification
        if (qualificationSelect.value === 'Other' && otherQualificationInput.value.trim() === '') {
            showError(otherQualificationInput, 'Please specify other qualification');
            return;
        }

        // Special validation for caste
        if (casteSelect.value === 'Others' && otherCasteInput.value.trim() === '') {
            showError(otherCasteInput, 'Please specify other caste');
            return;
        }

        if (!/^\d{10}$/.test(studentObj.candidatePhone)) {
            showError(document.getElementById('candidatePhone'), 'Mobile must be exactly 10 digits');
            return;
        }
        console.log(studentObj);
        try {

            const res = await fetch('/.netlify/functions/addOrUpdateStudent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(studentObj)
            });
            const data = await res.json();
            if (data.success) {
                showMessage('success', data.message || 'Student saved successfully');
                setTimeout(() => {
                    studentFormModal.style.display = 'none';
                    fetchStudents();
                }, 1000);
            }else {
                showMessage('error', data.message || 'Failed to save student');
            }
        } catch (err) {
            console.error(err);
            showMessage('error', 'Error saving student');
        }
    });

    // ------------------------------
    // View Student Modal (Updated Tabular Format)
    // ------------------------------
    function openViewStudentModal(id) {
        const student = studentsData.find(s => s.userId === id);
        if (!student) return;

        const existingModal = document.getElementById("viewStudentModal");
        if (existingModal) existingModal.remove();

        const modal = document.createElement("div");
        modal.id = "viewStudentModal";
        modal.className = "modal show";
        modal.style.display = "block";
        modal.innerHTML = `
          <div class="modal-content" style="max-width: 900px; padding: 20px; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); background: #fff;">
            <button class="close-btn" style="position: absolute; top: 10px; right: 15px; font-size: 24px; cursor: pointer; color: #333;">&times;</button>
            <h2 style="text-align:center; margin-bottom: 20px; color: #333; font-weight: bold;">Student Details</h2>
            <table class="student-details-table" id="studentDetailsTable">
              <tr><td colspan="2" class="group-title">Basic Information</td></tr>
              <tr><td><i class="fas fa-id-card" style="margin-right: 10px; color: #007bff;"></i><strong>User ID:</strong></td><td>${student.userId || "N/A"}</td></tr>
              <tr><td><i class="fas fa-user" style="margin-right: 10px; color: #28a745;"></i><strong>Name:</strong></td><td>${student.candidateName || "N/A"}</td></tr>
              <tr><td><i class="fas fa-envelope" style="margin-right: 10px; color: #dc3545;"></i><strong>Email:</strong></td><td>${student.email || "N/A"}</td></tr>
              <tr><td><i class="fas fa-toggle-on" style="margin-right: 10px; color: #fd7e14;"></i><strong>Status:</strong></td><td>${student.status || "N/A"}</td></tr>
              <tr><td><i class="fas fa-clock" style="margin-right: 10px; color: #20c997;"></i><strong>Creation Date:</strong></td><td>${student.creationDate || "N/A"}</td></tr>
              <tr><td colspan="2" class="group-title">Personal Details</td></tr>
              <tr><td><i class="fas fa-users" style="margin-right: 10px; color: #28a745;"></i><strong>Father/Husband Name:</strong></td><td>${student.fatherHusbandName || "N/A"}</td></tr>
              <tr><td><i class="fas fa-home" style="margin-right: 10px; color: #dc3545;"></i><strong>Village Name:</strong></td><td>${student.villageName || "N/A"}</td></tr>
              <tr><td><i class="fas fa-city" style="margin-right: 10px; color: #e83e8c;"></i><strong>Taluk Name:</strong></td><td>${student.talukName || "N/A"}</td></tr>
              <tr><td><i class="fas fa-map-marker-alt" style="margin-right: 10px; color: #17a2b8;"></i><strong>District Name:</strong></td><td>${student.districtName || "N/A"}</td></tr>
              <tr><td><i class="fas fa-birthday-cake" style="margin-right: 10px; color: #e83e8c;"></i><strong>Date of Birth:</strong></td><td>${student.dob || "N/A"}</td></tr>
              <tr><td><i class="fas fa-calendar-alt" style="margin-right: 10px; color: #6f42c1;"></i><strong>Age:</strong></td><td>${student.age || "N/A"}</td></tr>
              <tr><td><i class="fas fa-venus-mars" style="margin-right: 10px; color: #fd7e14;"></i><strong>Gender:</strong></td><td>${student.gender || "N/A"}</td></tr>
              <tr><td><i class="fas fa-users-cog" style="margin-right: 10px; color: #20c997;"></i><strong>Tribal:</strong></td><td>${student.tribal || "N/A"}</td></tr>
              <tr><td><i class="fas fa-wheelchair" style="margin-right: 10px; color: #007bff;"></i><strong>Person with Disability:</strong></td><td>${student.pwd || "N/A"}</td></tr>
              <tr><td><i class="fas fa-user-check" style="margin-right: 10px; color: #28a745;"></i><strong>Other Tribal:</strong></td><td>${student.otherTribal || "N/A"}</td></tr>
              <tr><td><i class="fas fa-user-injured" style="margin-right: 10px; color: #dc3545;"></i><strong>Other PWD:</strong></td><td>${student.otherPwd || "N/A"}</td></tr>
              <tr><td colspan="2" class="group-title">Contact & Identification</td></tr>
              <tr><td><i class="fas fa-id-badge" style="margin-right: 10px; color: #007bff;"></i><strong>Aadhaar Number:</strong></td><td>${student.aadharNumber || "N/A"}</td></tr>
              <tr><td><i class="fas fa-mobile-alt" style="margin-right: 10px; color: #17a2b8;"></i><strong>Mobile Number:</strong></td><td>${student.mobile || "N/A"}</td></tr>
              <tr><td><i class="fas fa-phone" style="margin-right: 10px; color: #17a2b8;"></i><strong>Parent Mobile No:</strong></td><td>${student.parentPhone || "N/A"}</td></tr>
              <tr><td colspan="2" class="group-title">Additional Information</td></tr>
              <tr><td><i class="fas fa-users" style="margin-right: 10px; color: #e83e8c;"></i><strong>Family Members:</strong></td><td>${student.familyMembers || "N/A"}</td></tr>
              <tr><td><i class="fas fa-graduation-cap" style="margin-right: 10px; color: #20c997;"></i><strong>Qualification:</strong></td><td>${student.education === 'Other' ? (student.otherQualification || 'N/A') : (student.education || 'N/A')}</td></tr>
              <tr><td><i class="fas fa-user-friends" style="margin-right: 10px; color: #6f42c1;"></i><strong>Caste:</strong></td><td>${student.caste || "N/A"}</td></tr>
              <tr><td><i class="fas fa-user-tag" style="margin-right: 10px; color: #fd7e14;"></i><strong>Other Caste:</strong></td><td>${student.otherCaste || "N/A"}</td></tr>
              <tr><td><i class="fas fa-user-friends" style="margin-right: 10px; color: #007bff;"></i><strong>Mobiliser Name:</strong></td><td>${student.fieldMobiliserName || "N/A"}</td></tr>
              <tr><td><i class="fas fa-project-diagram" style="margin-right: 10px; color: #6f42c1;"></i><strong>Supported Project:</strong></td><td>${student.supportedProject || "N/A"}</td></tr>
              <tr><td><i class="fas fa-handshake" style="margin-right: 10px; color: #fd7e14;"></i><strong>Referral Source:</strong></td><td>${student.referralSource || "N/A"}</td></tr>
              <tr><td><i class="fas fa-user-tie" style="margin-right: 10px; color: #20c997;"></i><strong>Staff Name:</strong></td><td>${student.staffName || "N/A"}</td></tr>
            </table>
          </div>
        `;

        document.body.appendChild(modal);

        modal.querySelector(".close-btn").addEventListener("click", () => modal.remove());
        window.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
    }

    // ------------------------------
    // Search
    // ------------------------------
    searchBtn.addEventListener('click', () => {
        currentPage = 1;
        renderStudentsTable();
    });

    searchInput.addEventListener('keyup', e => {
        if (e.key === 'Enter') { currentPage = 1; renderStudentsTable(); }
    });

    statusFilter.addEventListener("change", () => {
        currentPage = 1;
        renderStudentsTable();
    });

    // ------------------------------
    // Pagination Controls
    // ------------------------------
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderStudentsTable(); }
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(studentsData.length / rowsPerPage) || 1;
        if (currentPage < totalPages) { currentPage++; renderStudentsTable(); }
    });

    function formatStatusDisplay(status) {
    if (!status && status !== 0) return '-';
    const s = String(status).toLowerCase();
    if (s === 'approved') return 'Approved';
    if (s === 'rejected') return 'Rejected';
    if (s === 'pending') return 'Pending';
    // fallback: capitalize first letter
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

    // ------------------------------
    // Requests Modal
    // ------------------------------
    async function fetchRequests() {
        try {
            const res = await fetch('/.netlify/functions/studentallrequest');
            const data = await res.json();
            const requests = data.students || [];
            requestsBadge.textContent = requests.length;
            requestsTableBody.innerHTML = '';

            requests.forEach(req => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${req.userId}</td>
                    <td>${req.candidateName}</td>
                    <td>${req.email}</td>
                    <td>${formatDate(req.createdAt)}</td>
                    <td>
                        <button class="approve-btn" data-id="${req.userId}">Approve</button>
                        <button class="reject-btn" data-id="${req.userId}">Reject</button>
                    </td>
                `;
                requestsTableBody.appendChild(tr);
            });

            document.querySelectorAll('.approve-btn').forEach(btn => {
                btn.addEventListener('click', () => updateRequest(btn.dataset.id, 'approved'));
            });
            document.querySelectorAll('.reject-btn').forEach(btn => {
                btn.addEventListener('click', () => updateRequest(btn.dataset.id, 'rejected'));
            });
        } catch (err) {
            console.error(err);
        }
    }

    async function updateRequest(id, status) {
        try {
            const res = await fetch('/.netlify/functions/studentrequesthandler', {
                method: 'POST',
                body: JSON.stringify({ id, status })
            });
            const data = await res.json();
            if (data.success) {
                showApprovalMessage('success', `Request ${status}`);
                await fetchRequests();
            } else {
                showApprovalMessage('error', 'Failed to update request');
            }
        } catch (err) {
            console.error(err);
            showApprovalMessage('error', 'Error updating request');
        }
    }

    viewRequestsBtn.addEventListener('click', () => {
        requestsModal.style.display = 'flex';
    });

    // ------------------------------
    // Close Modals
    // ------------------------------
    document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.closest('.modal').style.display = 'none';
        location.reload(); // reload after modal closes
    });
});

    // ------------------------------
    // Cancel Button
    // ------------------------------
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            studentFormModal.style.display = 'none';
        });
    }


    // ------------------------------
    // Assign Course Modal
    // ------------------------------
    let currentStudentId = null;
    let currentPayStudentId = null;
    let coursesData = [];
    let assignedStudents = new Set();
    let feeRecordsForPay = [];

    async function openAssignCourseModal(studentId) {
        currentStudentId = studentId;
        const modal = document.getElementById('assignCourseModal');
        const courseSelect = document.getElementById('courseSelect');
        const courseDetails = document.getElementById('courseDetails');
        const assignMessage = document.getElementById('assignMessage');

        // Reset modal
        courseSelect.innerHTML = '<option value="">Loading courses...</option>';
        courseDetails.style.display = 'none';
        assignMessage.style.display = 'none';

        // Fetch courses
        try {
            const res = await fetch('/.netlify/functions/allCourses');
            const data = await res.json();
            coursesData = data.courses || [];
            courseSelect.innerHTML = '<option value="">Select Course</option>';
            coursesData.forEach(course => {
                const option = document.createElement('option');
                option.value = course.courseId;
                option.textContent = `${course.courseId} - ${course.courseName}`;
                courseSelect.appendChild(option);
            });
        } catch (err) {
            console.error('Error fetching courses:', err);
            courseSelect.innerHTML = '<option value="">Error loading courses</option>';
        }

        modal.classList.add('show');
    }

    // Course select change to show details
    document.getElementById('courseSelect').addEventListener('change', function() {
        const selectedCourseId = this.value;
        const courseDetails = document.getElementById('courseDetails');
        const selectedCourseName = document.getElementById('selectedCourseName');
        const selectedCoursePrice = document.getElementById('selectedCoursePrice');
        const selectedCourseFunded = document.getElementById('selectedCourseFunded');
        const selectedCourseStudentAmt = document.getElementById('selectedCourseStudentAmt');
        const selectedCourseDuration = document.getElementById('selectedCourseDuration');
        const selectedCourseLocation = document.getElementById('selectedCourseLocation');

        if (selectedCourseId) {
            const course = coursesData.find(c => c.courseId === selectedCourseId);
            if (course) {
                const price = Number(course.price || 0);
                const funded = Number(course.donorFundAmount || 0);
                const studentAmt = Math.max(0, price - funded);

                selectedCourseName.textContent = course.courseName;
                selectedCoursePrice.textContent = price.toLocaleString('en-IN');
                if (selectedCourseFunded) selectedCourseFunded.textContent = funded.toLocaleString('en-IN');
                if (selectedCourseStudentAmt) selectedCourseStudentAmt.textContent = studentAmt.toLocaleString('en-IN');
                selectedCourseDuration.textContent = course.durationMonths;
                selectedCourseLocation.textContent = course.location;
                courseDetails.style.display = 'block';
            }
        } else {
            courseDetails.style.display = 'none';
        }
    });

    // Assign Course Form Submit
    document.getElementById('assignCourseForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const courseSelect = document.getElementById('courseSelect');
        const assignMessage = document.getElementById('assignMessage');
        const selectedCourseId = courseSelect.value;

        if (!selectedCourseId) {
            assignMessage.textContent = 'Please select a course.';
            assignMessage.className = 'message error';
            assignMessage.style.display = 'block';
            return;
        }

        const course = coursesData.find(c => c.courseId === selectedCourseId);
        if (!course) {
            assignMessage.textContent = 'Selected course not found.';
            assignMessage.className = 'message error';
            assignMessage.style.display = 'block';
            return;
        }

        const payload = {
            courseId: course.courseId,
            courseName: course.courseName,
            studentId: currentStudentId,
            totalPrice: course.price,
            fundedAmount: course.donorFundAmount || 0
        };

        try {
            const res = await fetch('/.netlify/functions/assignCourse', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                assignedStudents.add(currentStudentId); // Mark student as assigned
                assignMessage.textContent = 'Course assigned successfully!';
                assignMessage.className = 'message success';
                assignMessage.style.display = 'block';
                setTimeout(() => {
                    document.getElementById('assignCourseModal').classList.remove('show');
                    fetchStudents(); // Refresh student list
                }, 2000);
            } else {
                assignMessage.textContent = data.message || 'Failed to assign course.';
                assignMessage.className = 'message error';
                assignMessage.style.display = 'block';
            }
        } catch (err) {
            console.error('Error assigning course:', err);
            assignMessage.textContent = 'Error assigning course.';
            assignMessage.className = 'message error';
            assignMessage.style.display = 'block';
        }
    });

    // Cancel Assign Course
    document.getElementById('cancelAssignBtn').addEventListener('click', function() {
        document.getElementById('assignCourseModal').classList.remove('show');
    });

    // ------------------------------
    // Admin Pay Dues modal and handlers
    // ------------------------------
    function createAdminPayModal() {
        if (document.getElementById('adminPayModal')) return;

        const style = document.createElement('style');
        style.textContent = `
        .pay-modal-backdrop {
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgba(0, 0, 0, 0.4);
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        .pay-modal-backdrop.show { display: flex; }
        .pay-modal {
            background-color: white;
            margin: auto;
            padding: 30px;
            border-radius: 12px;
            width: 90%;
            max-width: 800px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
            position: relative;
            animation-name: animatetop;
            animation-duration: 0.4s;
        }
        .pay-modal h3 {
            margin-top: 0;
            font-size: 1.6rem;
            color: #2e4f8f;
            border-bottom: 2px solid rgba(233,236,239,0.8);
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .pay-modal .row { margin-bottom: 12px; }
        .pay-modal label { font-family: 'Poppins', sans-serif; display: block; margin-bottom: 6px; font-size: 16px; color: #333; }
        .pay-modal select,
        .pay-modal input { font-family: 'Poppins', sans-serif;font-size: 14px; width: 100%; padding: 10px; border: 1px solid #e9ecef; border-radius: 8px; box-sizing: border-box; }
        .pay-modal .actions { display:flex; gap:10px; justify-content:flex-end; margin-top:14px; }
        .pay-modal .btn { padding: 10px 16px; border-radius: 8px; border: none; cursor: pointer; }
        .pay-modal .btn.primary { background: var(--primary-color, #2e4f8f); color: #fff; }
        .pay-modal .btn.secondary { background: #f1f1f1; color: #333; }
        @keyframes animatetop {
            from { top: -300px; opacity: 0; }
            to { top: 0; opacity: 1; }
        }`;
        document.head.appendChild(style);

        const backdrop = document.createElement('div');
        backdrop.id = 'adminPayModal';
        backdrop.className = 'pay-modal-backdrop';

        backdrop.innerHTML = `
            <div class="pay-modal" role="dialog" aria-modal="true" aria-labelledby="adminPayModalTitle">
                <span class="close-btn" id="adminPayModalCloseBtn" aria-label="Close" style="position: absolute; top: 10px; right: 20px; font-size: 28px; cursor: pointer; color: #888;">&times;</span>
                <h3 id="adminPayModalTitle">Pay Due</h3>
                <div class="row">
                    <label for="adminPayCourseSelect">Select Course</label>
                    <select id="adminPayCourseSelect"><option value="">Loading...</option></select>
                </div>
                <div class="row">
                    <label for="adminPayAmountInput">Amount (INR)</label>
                    <input id="adminPayAmountInput" type="number" step="0.01" min="0" />
                </div>
                <div class="row">
                    <label for="adminPayMethodSelect">Payment Mode</label>
                    <select id="adminPayMethodSelect">
                        <option value="UPI">UPI</option>
                        <option value="Card">Card</option>
                        <option value="Cash">Cash</option>
                        <option value="Net Banking">Net Banking</option>
                    </select>
                </div>
                <div class="actions">
                    <button class="btn secondary" id="adminCancelPayBtn">Cancel</button>
                    <button class="btn primary" id="adminSubmitPayBtn">Submit Payment</button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);

        document.getElementById('adminCancelPayBtn').addEventListener('click', closeAdminPayModal);
        document.getElementById('adminPayCourseSelect').addEventListener('change', onAdminPayCourseSelectChange);
        document.getElementById('adminSubmitPayBtn').addEventListener('click', onAdminSubmitPayment);
        const closeBtn = document.getElementById('adminPayModalCloseBtn');
        if (closeBtn) closeBtn.addEventListener('click', closeAdminPayModal);
    }

    async function openAdminPayModal(studentId) {
        currentPayStudentId = studentId;
        createAdminPayModal();
        const modal = document.getElementById('adminPayModal');
        if (modal) modal.classList.add('show');

        await fetchStudentFeeDataForPay(studentId);
        populateAdminPayCourseDropdown();
    }

    function closeAdminPayModal() {
        const modal = document.getElementById('adminPayModal');
        if (modal) modal.remove();
    }

    function populateAdminPayCourseDropdown() {
        const select = document.getElementById('adminPayCourseSelect');
        const amountInput = document.getElementById('adminPayAmountInput');
        if (!select) return;

        select.innerHTML = '';

        if (!feeRecordsForPay || !feeRecordsForPay.length) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = 'No enrolled courses found';
            select.appendChild(opt);
            amountInput.value = '';
            return;
        }

        feeRecordsForPay.forEach((f, idx) => {
            const due = (f.dueAmount != null) ? f.dueAmount : ((f.totalAmount || 0) - (f.amountPaid || 0));
            const opt = document.createElement('option');
            opt.value = f.courseId || f.id || '';
            opt.textContent = `${f.courseName || 'Course'} (Due: INR ${Number(due).toFixed(2)})`;
            opt.dataset.idx = String(idx);
            select.appendChild(opt);
        });

        select.selectedIndex = 0;
        onAdminPayCourseSelectChange();
    }

    function onAdminPayCourseSelectChange() {
        const select = document.getElementById('adminPayCourseSelect');
        const amountInput = document.getElementById('adminPayAmountInput');
        const courseId = select.value;
        if (!courseId) {
            amountInput.value = '';
            return;
        }
        const f = feeRecordsForPay.find(r => (r.courseId === courseId) || (r.id === courseId));
        if (f) {
            const due = (f.dueAmount != null) ? f.dueAmount : ((f.totalAmount || 0) - (f.amountPaid || 0));
            amountInput.value = Number(due).toFixed(2);
        } else {
            const opt = select.selectedOptions[0];
            const due = opt && opt.dataset && opt.dataset.due ? Number(opt.dataset.due) : '';
            amountInput.value = due !== '' ? Number(due).toFixed(2) : '';
        }
    }

    async function onAdminSubmitPayment(ev) {
        ev.preventDefault();
        const select = document.getElementById('adminPayCourseSelect');
        const amountInput = document.getElementById('adminPayAmountInput');
        const methodSelect = document.getElementById('adminPayMethodSelect');

        const courseId = select.value;
        if (!courseId) {
            alert('Please select a valid course to pay for.');
            return;
        }

        const amount = parseFloat(amountInput.value);
        if (!amount || amount <= 0) {
            alert('Please enter a valid amount greater than 0.');
            return;
        }

        const payload = {
            studentId: currentPayStudentId,
            courseId: courseId,
            amount: amount,
            paymentMethod: methodSelect.value || 'UPI'
        };

        const submitBtn = document.getElementById('adminSubmitPayBtn');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Processing...';
        }

        try {
            const res = await fetch('/.netlify/functions/payDues', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const body = await res.json();
            if (!res.ok) {
                console.error('Payment failed', body);
                alert(body.message || 'Payment failed.');
                return;
            }
            alert(body.message || 'Payment successful');
            closeAdminPayModal();
        } catch (err) {
            console.error('Error submitting payment:', err);
            alert('An error occurred while processing the payment.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Payment';
            }
        }
    }

    async function fetchStudentFeeDataForPay(studentId) {
        try {
            const res = await fetch('/.netlify/functions/getStudentFees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ studentId })
            });
            if (!res.ok) throw new Error('Failed to fetch fee data for student');
            const data = await res.json();
            feeRecordsForPay = data || [];
        } catch (e) {
            console.error('Error fetching fee data for admin pay:', e);
            feeRecordsForPay = [];
        }
    }

    // ------------------------------
    // Initialize
    // ------------------------------
    fetchStudents();
    fetchRequests();
});
