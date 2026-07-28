import deptData from '../data/departments.json';

export function renderHomePage(lang) {
  const l = lang;

  return `
  <div class="container-fluid px-lg-4 py-4 text-start">
    <div class="row g-4">
      
      <!-- Top Row: Hero Search Banner (Col 8) + All Departments Sidebar (Col 4) -->
      <div class="col-lg-8">
        <div class="nb-card nb-home-hero p-4 p-md-5 h-100 position-relative overflow-hidden" style="border: 0;">

          <div class="position-relative z-1" style="max-width: 540px;">
            <div class="d-inline-flex align-items-center gap-2 px-3 py-1 rounded-pill bg-body-tertiary text-primary border shadow-2xs mb-3 fw-bold" style="font-size:0.75rem; letter-spacing:0.04em;">
              <i class="bi bi-shield-check text-primary"></i>
              <span>BENGALURU CITIZEN PORTAL</span>
            </div>

            <h1 class="fw-extrabold text-body mb-2" style="font-size: clamp(1.8rem, 3vw, 2.4rem); letter-spacing:-0.03em; line-height:1.2;">
              Information. Services. Solutions.<br/>
              <span class="text-primary">All Government Departments, One Place.</span>
            </h1>

            <p class="text-secondary mb-4" style="font-size:0.95rem; line-height:1.6;">
              Your one-stop open-source platform for everything about BWSSB, BESCOM, Namma Metro, BBMP, and Bengaluru public services.
            </p>

            <!-- Search Form Bar -->
            <div class="input-group input-group-lg shadow-sm rounded-3 mb-3 border bg-body">
              <span class="input-group-text bg-transparent border-0 ps-3 text-secondary">
                <i class="bi bi-search fs-5"></i>
              </span>
              <input type="text" id="homeSearchInput" class="form-control border-0 bg-transparent py-3 fs-6" placeholder="Search for services, guides, calculators..." onkeyup="window.__handleHomeSearch(event)">
              <button class="btn btn-primary px-4 fw-semibold rounded-3 m-1" onclick="window.__triggerHomeSearch()">
                Search
              </button>
            </div>

            <!-- Popular Quick Pills -->
            <div class="d-flex align-items-center gap-2 flex-wrap" style="font-size:0.8rem;">
              <span class="text-secondary fw-semibold me-1">Popular:</span>
              <a href="https://bescom.co.in/bescom/main/quick-payment" target="_blank" rel="noopener" class="badge text-decoration-none px-3 py-2 hover-shadow bg-success-subtle text-success border border-success-subtle" style="font-weight:600;"><i class="bi bi-lightning-charge-fill me-1"></i>BESCOM Quick Pay</a>
              <a href="#/dept/bescom/planned-outages" class="badge text-decoration-none px-3 py-2 hover-shadow bg-primary-subtle text-primary border border-primary-subtle" style="font-weight:500;">Power Outages</a>
              <a href="#/dept/bwssb/services" class="badge text-decoration-none px-3 py-2 hover-shadow bg-primary-subtle text-primary border border-primary-subtle" style="font-weight:500;">BWSSB Connection</a>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: All Departments Sidebar Card (Col 4) -->
      <div class="col-lg-4">
        <div class="nb-card p-4 h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <h5 class="fw-bold mb-0" style="font-size:1.05rem;">All Departments</h5>
              <a href="#/departments" class="text-primary text-decoration-none fw-semibold" style="font-size:0.8rem;">View all <i class="bi bi-arrow-right ms-1"></i></a>
            </div>

            <div class="d-flex flex-column gap-2">
              <!-- BWSSB -->
              <a href="#/dept/bwssb" class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between text-decoration-none text-body hover-shadow transition-all">
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-2 text-primary bg-primary-subtle d-flex align-items-center justify-content-center flex-shrink-0" style="width:40px; height:40px; font-size:1.2rem;">
                    <i class="bi bi-droplet-half"></i>
                  </div>
                  <div>
                    <div class="fw-bold" style="font-size:0.88rem;">BWSSB</div>
                    <div class="text-secondary" style="font-size:0.75rem;">Water supply, Sewerage, Connections, Tariff & more</div>
                  </div>
                </div>
                <i class="bi bi-chevron-right text-secondary fs-6"></i>
              </a>

              <!-- BESCOM -->
              <a href="#/dept/bescom" class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between text-decoration-none text-body hover-shadow transition-all">
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-2 text-warning bg-warning-subtle d-flex align-items-center justify-content-center flex-shrink-0" style="width:40px; height:40px; font-size:1.2rem;">
                    <i class="bi bi-lightning-charge-fill"></i>
                  </div>
                  <div>
                    <div class="fw-bold" style="font-size:0.88rem;">BESCOM</div>
                    <div class="text-secondary" style="font-size:0.75rem;">Electricity, Billing, Tariff, Outages & more</div>
                  </div>
                </div>
                <i class="bi bi-chevron-right text-secondary fs-6"></i>
              </a>

              <!-- Namma Metro -->
              <a href="#/dept/bmtc" class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between text-decoration-none text-body hover-shadow transition-all">
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-2 text-danger bg-danger-subtle d-flex align-items-center justify-content-center flex-shrink-0" style="width:40px; height:40px; font-size:1.2rem;">
                    <i class="bi bi-train-front-fill"></i>
                  </div>
                  <div>
                    <div class="fw-bold" style="font-size:0.88rem;">Namma Metro</div>
                    <div class="text-secondary" style="font-size:0.75rem;">Routes, Fares, Passes, Timings & more</div>
                  </div>
                </div>
                <i class="bi bi-chevron-right text-secondary fs-6"></i>
              </a>

              <!-- BBMP -->
              <a href="#/dept/bbmp" class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between text-decoration-none text-body hover-shadow transition-all">
                <div class="d-flex align-items-center gap-3">
                  <div class="rounded-2 text-info bg-info-subtle d-flex align-items-center justify-content-center flex-shrink-0" style="width:40px; height:40px; font-size:1.2rem;">
                    <i class="bi bi-building"></i>
                  </div>
                  <div>
                    <div class="fw-bold" style="font-size:0.88rem;">BBMP</div>
                    <div class="text-secondary" style="font-size:0.75rem;">Property Tax, Khata, Trade License & Ward Works</div>
                  </div>
                </div>
                <i class="bi bi-chevron-right text-secondary fs-6"></i>
              </a>
            </div>

            <!-- More Departments button pointing to #/departments -->
            <a href="#/departments" class="d-flex align-items-center justify-content-between p-2 rounded-2 text-decoration-none text-secondary hover-bg-tertiary mt-2" style="font-size:0.82rem;">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-grid-3x3-gap"></i>
                <span class="fw-semibold">More Departments</span>
              </div>
              <i class="bi bi-chevron-right fs-6"></i>
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Actions 6 Grid Cards Row: BESCOM Quick Tools -->
      <div class="col-12">
        <div class="row g-3">
          <!-- Card 1: BESCOM Bill Calculator -->
          <div class="col-sm-6 col-md-4 col-xl-2">
            <div class="nb-card p-3 h-100 text-start d-flex flex-column justify-content-between hover-shadow">
              <div>
                <div class="rounded-2 d-inline-flex align-items-center justify-content-center p-2 mb-3" style="width:40px; height:40px; background:#fef3c7; color:#d97706;">
                  <i class="bi bi-calculator-fill fs-5"></i>
                </div>
                <h6 class="fw-bold mb-1" style="font-size:0.88rem; color:#1e293b;">BESCOM Bill Calculator</h6>
                <p class="text-secondary mb-3" style="font-size:0.76rem; line-height:1.45;">Calculate your estimated electricity bill based on units consumed.</p>
              </div>
              <a href="#/dept/bescom/calculator" class="text-primary text-decoration-none fw-bold" style="font-size:0.78rem;">Calculate Now <i class="bi bi-arrow-right ms-1"></i></a>
            </div>
          </div>

          <!-- Card 2: BESCOM Tariff Rates -->
          <div class="col-sm-6 col-md-4 col-xl-2">
            <div class="nb-card p-3 h-100 text-start d-flex flex-column justify-content-between hover-shadow">
              <div>
                <div class="rounded-2 d-inline-flex align-items-center justify-content-center p-2 mb-3" style="width:40px; height:40px; background:#dcfce7; color:#059669;">
                  <i class="bi bi-currency-rupee fs-5"></i>
                </div>
                <h6 class="fw-bold mb-1" style="font-size:0.88rem; color:#1e293b;">BESCOM Tariff Rates</h6>
                <p class="text-secondary mb-3" style="font-size:0.76rem; line-height:1.45;">Check official BESCOM 2026-27 electricity slab rates & fixed charges.</p>
              </div>
              <a href="#/dept/bescom/tariff" class="text-primary text-decoration-none fw-bold" style="font-size:0.78rem;">View Tariff Rates <i class="bi bi-arrow-right ms-1"></i></a>
            </div>
          </div>

          <!-- Card 3: BESCOM Power Outages -->
          <div class="col-sm-6 col-md-4 col-xl-2">
            <div class="nb-card p-3 h-100 text-start d-flex flex-column justify-content-between hover-shadow">
              <div>
                <div class="rounded-2 d-inline-flex align-items-center justify-content-center p-2 mb-3" style="width:40px; height:40px; background:#fee2e2; color:#dc2626;">
                  <i class="bi bi-calendar-event-fill fs-5"></i>
                </div>
                <h6 class="fw-bold mb-1" style="font-size:0.88rem; color:#1e293b;">BESCOM Power Outages</h6>
                <p class="text-secondary mb-3" style="font-size:0.76rem; line-height:1.45;">Check announced power shutdowns & feeder maintenance.</p>
              </div>
              <a href="#/dept/bescom/planned-outages" class="text-primary text-decoration-none fw-bold" style="font-size:0.78rem;">View Power Outages <i class="bi bi-arrow-right ms-1"></i></a>
            </div>
          </div>

          <!-- Card 4: BESCOM Crowd Reports -->
          <div class="col-sm-6 col-md-4 col-xl-2">
            <div class="nb-card p-3 h-100 text-start d-flex flex-column justify-content-between hover-shadow">
              <div>
                <div class="rounded-2 d-inline-flex align-items-center justify-content-center p-2 mb-3" style="width:40px; height:40px; background:#cff4fc; color:#0284c7;">
                  <i class="bi bi-people-fill fs-5"></i>
                </div>
                <h6 class="fw-bold mb-1" style="font-size:0.88rem; color:#1e293b;">BESCOM Crowd Reports</h6>
                <p class="text-secondary mb-3" style="font-size:0.76rem; line-height:1.45;">Real-time citizen power outage crowd reports & status.</p>
              </div>
              <a href="#/dept/bescom/crowd-reports" class="text-primary text-decoration-none fw-bold" style="font-size:0.78rem;">Check Crowd <i class="bi bi-arrow-right ms-1"></i></a>
            </div>
          </div>

          <!-- Card 5: BESCOM Online Services -->
          <div class="col-sm-6 col-md-4 col-xl-2">
            <div class="nb-card p-3 h-100 text-start d-flex flex-column justify-content-between hover-shadow">
              <div>
                <div class="rounded-2 d-inline-flex align-items-center justify-content-center p-2 mb-3" style="width:40px; height:40px; background:#dbeafe; color:#2563eb;">
                  <i class="bi bi-file-earmark-text-fill fs-5"></i>
                </div>
                <h6 class="fw-bold mb-1" style="font-size:0.88rem; color:#1e293b;">BESCOM Online Services</h6>
                <p class="text-secondary mb-3" style="font-size:0.76rem; line-height:1.45;">Find name change, new connection, and LT applications.</p>
              </div>
              <a href="#/dept/bescom/services" class="text-primary text-decoration-none fw-bold" style="font-size:0.78rem;">Explore Services <i class="bi bi-arrow-right ms-1"></i></a>
            </div>
          </div>

          <!-- Card 6: BESCOM Grievance Guide -->
          <div class="col-sm-6 col-md-4 col-xl-2">
            <div class="nb-card p-3 h-100 text-start d-flex flex-column justify-content-between hover-shadow">
              <div>
                <div class="rounded-2 d-inline-flex align-items-center justify-content-center p-2 mb-3" style="width:40px; height:40px; background:#f3e8ff; color:#9333ea;">
                  <i class="bi bi-headset fs-5"></i>
                </div>
                <h6 class="fw-bold mb-1" style="font-size:0.88rem; color:#1e293b;">BESCOM Grievance Guide</h6>
                <p class="text-secondary mb-3" style="font-size:0.76rem; line-height:1.45;">Step-by-step guide to file 1912 power complaints & RTI.</p>
              </div>
              <a href="#/dept/bescom/complaint" class="text-primary text-decoration-none fw-bold" style="font-size:0.78rem;">File Power Complaint <i class="bi bi-arrow-right ms-1"></i></a>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom 3-Column Feature Hub: Services & Applications (Col 4), Complaint Guide (Col 4), Social Feed (Col 4) -->
      <div class="col-lg-4">
        <div class="nb-card p-3 h-100 text-start">
          <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <h6 class="fw-bold mb-0" style="font-size:0.95rem;">Services & Applications</h6>
            <a href="#/dept/bescom/services" class="text-primary text-decoration-none fw-semibold" style="font-size:0.78rem;">View all <i class="bi bi-arrow-right ms-1"></i></a>
          </div>

          <div class="d-flex flex-column gap-2">
            <div class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-2 bg-success-subtle text-success p-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width:34px; height:34px;">
                  <i class="bi bi-lightning-charge-fill fs-6"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.84rem;">New BESCOM Connection</div>
                  <div class="text-secondary" style="font-size:0.73rem;">Apply for a new electricity connection.</div>
                </div>
              </div>
              <a href="#/dept/bescom/services" class="badge rounded-pill text-decoration-none px-3 py-2 fw-semibold ms-2" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; font-size:0.73rem;">How to Apply &gt;</a>
            </div>

            <div class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-2 bg-info-subtle text-info p-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width:34px; height:34px;">
                  <i class="bi bi-pencil-square fs-6"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.84rem;">Change of Name in BESCOM</div>
                  <div class="text-secondary" style="font-size:0.73rem;">Update name in your electricity account.</div>
                </div>
              </div>
              <a href="#/dept/bescom/services" class="badge rounded-pill text-decoration-none px-3 py-2 fw-semibold ms-2" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; font-size:0.73rem;">How to Apply &gt;</a>
            </div>

            <div class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-2 bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width:34px; height:34px;">
                  <i class="bi bi-droplet-fill fs-6"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.84rem;">BWSSB Water Connection</div>
                  <div class="text-secondary" style="font-size:0.73rem;">Apply for new water connection.</div>
                </div>
              </div>
              <a href="#/dept/bwssb/services" class="badge rounded-pill text-decoration-none px-3 py-2 fw-semibold ms-2" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; font-size:0.73rem;">How to Apply &gt;</a>
            </div>

            <div class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-2 bg-purple-subtle p-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width:34px; height:34px; background:rgba(124,58,237,0.12); color:#7c3aed;">
                  <i class="bi bi-credit-card-2-front fs-6"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.84rem;">Namma Metro Smart Card</div>
                  <div class="text-secondary" style="font-size:0.73rem;">Apply for Smart Card / Recharge online.</div>
                </div>
              </div>
              <a href="#/dept/bmtc" class="badge rounded-pill text-decoration-none px-3 py-2 fw-semibold ms-2" style="background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; font-size:0.73rem;">How to Apply &gt;</a>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="nb-card p-3 h-100 text-start">
          <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <h6 class="fw-bold mb-0" style="font-size:0.95rem;">Complaint Guide</h6>
            <a href="#/dept/bwssb/complaint" class="text-primary text-decoration-none fw-semibold" style="font-size:0.78rem;">View all <i class="bi bi-arrow-right ms-1"></i></a>
          </div>

          <div class="d-flex flex-column gap-2">
            <div class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-2 bg-warning-subtle text-warning p-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width:34px; height:34px;">
                  <i class="bi bi-exclamation-triangle-fill fs-6"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.84rem;">BESCOM Complaint</div>
                  <div class="text-secondary" style="font-size:0.73rem;">Billing issues, power failure, meter problems</div>
                </div>
              </div>
              <a href="#/dept/bescom/complaint" class="badge rounded-pill text-decoration-none px-3 py-2 fw-semibold ms-2" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca; font-size:0.73rem;">File Complaint &gt;</a>
            </div>

            <div class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-2 bg-primary-subtle text-primary p-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width:34px; height:34px;">
                  <i class="bi bi-tools fs-6"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.84rem;">BWSSB Complaint</div>
                  <div class="text-secondary" style="font-size:0.73rem;">Water supply issues, leakage, no water</div>
                </div>
              </div>
              <a href="#/dept/bwssb/complaint" class="badge rounded-pill text-decoration-none px-3 py-2 fw-semibold ms-2" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca; font-size:0.73rem;">File Complaint &gt;</a>
            </div>

            <div class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-2 bg-danger-subtle text-danger p-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width:34px; height:34px;">
                  <i class="bi bi-chat-left-dots fs-6"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.84rem;">Namma Metro Complaint</div>
                  <div class="text-secondary" style="font-size:0.73rem;">Metro services, staff, facilities</div>
                </div>
              </div>
              <a href="#/dept/bmtc" class="badge rounded-pill text-decoration-none px-3 py-2 fw-semibold ms-2" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca; font-size:0.73rem;">File Complaint &gt;</a>
            </div>

            <div class="p-3 rounded-3 border bg-body-tertiary d-flex align-items-center justify-content-between">
              <div class="d-flex align-items-center gap-2">
                <div class="rounded-2 bg-success-subtle text-success p-2 d-flex align-items-center justify-content-center flex-shrink-0" style="width:34px; height:34px;">
                  <i class="bi bi-shield-exclamation fs-6"></i>
                </div>
                <div>
                  <div class="fw-bold" style="font-size:0.84rem;">BBMP Complaint</div>
                  <div class="text-secondary" style="font-size:0.73rem;">Garbage, roads, streetlights, others</div>
                </div>
              </div>
              <a href="#/dept/bbmp" class="badge rounded-pill text-decoration-none px-3 py-2 fw-semibold ms-2" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca; font-size:0.73rem;">File Complaint &gt;</a>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="nb-card p-3 h-100 text-start">
          <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <h6 class="fw-bold mb-0" style="font-size:0.95rem;">Social Feed Updates</h6>
            <a href="#/dept/bescom" class="text-primary text-decoration-none fw-semibold" style="font-size:0.78rem;">View all <i class="bi bi-arrow-right ms-1"></i></a>
          </div>

          <div class="d-flex flex-column gap-2">
            <!-- BESCOM Tweet -->
            <div class="p-3 rounded-3 border bg-body-tertiary">
              <div class="d-flex align-items-center gap-2 mb-2">
                <div class="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center fw-bold" style="width:26px; height:26px; font-size:0.75rem;">B</div>
                <span class="fw-bold" style="font-size:0.83rem;">BESCOM</span>
                <span class="text-secondary" style="font-size:0.72rem;">@NammaBESCOM</span>
              </div>
              <p class="text-body mb-0" style="font-size:0.78rem; line-height:1.45;">
                Planned shutdown in parts of Rajajinagar for maintenance work. Helplines: 1912.
              </p>
            </div>

            <!-- BWSSB Tweet -->
            <div class="p-3 rounded-3 border bg-body-tertiary">
              <div class="d-flex align-items-center gap-2 mb-2">
                <div class="rounded-circle bg-info text-white d-flex align-items-center justify-content-center fw-bold" style="width:26px; height:26px; font-size:0.75rem;">W</div>
                <span class="fw-bold" style="font-size:0.83rem;">BWSSB</span>
                <span class="text-secondary" style="font-size:0.72rem;">@chairmanbwssb</span>
              </div>
              <p class="text-body mb-0" style="font-size:0.78rem; line-height:1.45;">
                Water supply maintenance update for South Bengaluru areas. 24x7 Support: 1916.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Documents Required Grid (Col 8) + Why This Project (Col 4) -->
      <div class="col-lg-8">
        <div class="nb-card p-3 h-100 text-start">
          <div class="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
            <h6 class="fw-bold mb-0" style="font-size:0.95rem;">Documents Required Directory</h6>
            <a href="#/dept/bescom/services" class="text-primary text-decoration-none fw-semibold" style="font-size:0.78rem;">View all <i class="bi bi-arrow-right ms-1"></i></a>
          </div>

          <div class="row g-3">
            <div class="col-sm-6 col-lg-3">
              <div class="p-3 rounded-3 border bg-body-tertiary h-100 d-flex flex-column justify-content-between hover-shadow">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="bi bi-file-earmark-check-fill text-success fs-5"></i>
                    <span class="fw-bold" style="font-size:0.83rem;">BESCOM Connection</span>
                  </div>
                  <p class="text-secondary mb-3" style="font-size:0.73rem; line-height:1.45;">ID Proof, Address Proof, Passport Photo, Property Document</p>
                </div>
                <a href="#/dept/bescom/services" class="text-primary text-decoration-none fw-bold" style="font-size:0.76rem;">View Details <i class="bi bi-arrow-right ms-1"></i></a>
              </div>
            </div>

            <div class="col-sm-6 col-lg-3">
              <div class="p-3 rounded-3 border bg-body-tertiary h-100 d-flex flex-column justify-content-between hover-shadow">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="bi bi-file-earmark-text-fill text-primary fs-5"></i>
                    <span class="fw-bold" style="font-size:0.83rem;">BWSSB Water</span>
                  </div>
                  <p class="text-secondary mb-3" style="font-size:0.73rem; line-height:1.45;">ID Proof, Photo, Address Proof, Property Document, Khata</p>
                </div>
                <a href="#/dept/bwssb/services" class="text-primary text-decoration-none fw-bold" style="font-size:0.76rem;">View Details <i class="bi bi-arrow-right ms-1"></i></a>
              </div>
            </div>

            <div class="col-sm-6 col-lg-3">
              <div class="p-3 rounded-3 border bg-body-tertiary h-100 d-flex flex-column justify-content-between hover-shadow">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="bi bi-credit-card-2-front-fill text-danger fs-5"></i>
                    <span class="fw-bold" style="font-size:0.83rem;">Namma Metro Pass</span>
                  </div>
                  <p class="text-secondary mb-3" style="font-size:0.73rem; line-height:1.45;">ID Proof, Photo, Address Proof (for Concession Pass)</p>
                </div>
                <a href="#/dept/bmtc" class="text-primary text-decoration-none fw-bold" style="font-size:0.76rem;">View Details <i class="bi bi-arrow-right ms-1"></i></a>
              </div>
            </div>

            <div class="col-sm-6 col-lg-3">
              <div class="p-3 rounded-3 border bg-body-tertiary h-100 d-flex flex-column justify-content-between hover-shadow">
                <div>
                  <div class="d-flex align-items-center gap-2 mb-2">
                    <i class="bi bi-building-check text-info fs-5"></i>
                    <span class="fw-bold" style="font-size:0.83rem;">BBMP Trade License</span>
                  </div>
                  <p class="text-secondary mb-3" style="font-size:0.73rem; line-height:1.45;">ID Proof, Address Proof, Property Document, Photo</p>
                </div>
                <a href="#/dept/bbmp" class="text-primary text-decoration-none fw-bold" style="font-size:0.76rem;">View Details <i class="bi bi-arrow-right ms-1"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="nb-card p-3 h-100 text-start d-flex flex-column justify-content-between">
          <div class="row align-items-center">
            <div class="col-7">
              <h6 class="fw-bold mb-3 pb-2 border-bottom" style="font-size:0.95rem;">Why This Project?</h6>
              <ul class="list-unstyled mb-3 d-flex flex-column gap-2" style="font-size:0.82rem;">
                <li class="d-flex align-items-center gap-2">
                  <i class="bi bi-check-lg text-success fw-bold fs-6"></i>
                  <span>Open Source & Community Driven</span>
                </li>
                <li class="d-flex align-items-center gap-2">
                  <i class="bi bi-check-lg text-success fw-bold fs-6"></i>
                  <span>Unbiased & Transparent Information</span>
                </li>
                <li class="d-flex align-items-center gap-2">
                  <i class="bi bi-check-lg text-success fw-bold fs-6"></i>
                  <span>One Place for All Citizen Needs</span>
                </li>
                <li class="d-flex align-items-center gap-2">
                  <i class="bi bi-check-lg text-success fw-bold fs-6"></i>
                  <span>Built with ❤️ for Bengaluru</span>
                </li>
              </ul>
            </div>
            <!-- Illustration Accent -->
            <div class="col-5 text-center">
              <div class="p-3 rounded-circle bg-primary-subtle text-primary d-inline-flex flex-column align-items-center justify-content-center shadow-2xs" style="width:88px; height:88px;">
                <i class="bi bi-code-slash display-6"></i>
                <div class="fw-bold mt-1" style="font-size:0.65rem;">Bengaluru</div>
              </div>
            </div>
          </div>

          <a href="https://github.com/vishwas-r/namma-bengaluru-portal" target="_blank" rel="noopener" class="btn btn-outline-dark w-100 rounded-3 d-flex align-items-center justify-content-center gap-2 py-2 mt-2" style="font-size:0.82rem;">
            <i class="bi bi-github"></i>
            <span>Star on GitHub</span>
          </a>
        </div>
      </div>

    </div>
  </div>`;
}
