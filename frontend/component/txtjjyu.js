
            {/* Right Content - Card Display */}
            <div className="relative">
              <div className="bg-[#0E1A1F] rounded-3xl p-8 border border-[#0E1A1F]/10 shadow-2xl shadow-[#6967FB]/10 backdrop-blur-lg">
                {/* Mock Browser Header */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>

                {/* Account Stats */}
                <div className="bg-white/8 rounded-2xl p-6 mb-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#C8F904] rounded-xl flex items-center justify-center">
                        <span className="text-2xl">₿</span>
                      </div>
                      <div>
                        <p className="text-sm text-white/60">Prop Firm Account</p>
                        <p className="text-xl font-bold text-white">$94,320.12</p>
                      </div>
                    </div>
                    <div className="text-[#C8F904] font-semibold">+8.2%</div>
                  </div>
                </div>

                {/* Service Card */}
                <div className="bg-[#6967FB] rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm"></div>
                      <span className="text-sm font-medium text-white">DIGITAL NOMAD CARD</span>
                    </div>
                    <p className="text-sm text-white/80 mb-4">Balance</p>
                    <p className="text-4xl font-bold mb-6 text-white">$4,250.00</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white/60">Active • Verified</span>
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating blobs */}
              <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#C8F904] rounded-2xl opacity-20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-[#6967FB] rounded-2xl opacity-20 blur-xl"></div>
            </div> 