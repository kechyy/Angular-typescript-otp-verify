verifyOtp() {
    const otpCode = this.otpForm.getRawValue();
    if (otpCode.otpValue === "") {
        this.messageService.add({
            severity: "error",
            detail: "Provide OTP code to Verify"
        });
    } else {
        const rawData = this.otpForm.getRawValue();
        log.info("this.action ", this.action);
        const data: ValidateOtp = {
            phoneNumber: this.mobileNo,
            resetCode: rawData.otpValue
        };
        if (this.action === "password-reset") {

            const passwordReset: PassResetOtpValidate = {
                emailAddr: this.emailAddrs,
                resetCode: rawData.otpValue,
                userType: this.userType
            };
            this.authService
                .verifyPasswordResetRequest(passwordReset)
                .subscribe((response) => {
                    if (response.correctOtp) {
                        if (this.mixPanel) {
                            this.mixPanelService.track("Password Reset Successful", {
                                device: this.deviceDetectorService.device,
                                os: this.deviceDetectorService.os,
                                date: Date.now()
                            });
                        }
                        this.messageService.add({
                            severity: "success",
                            summary: "Password Reset",
                            detail: "Password reset was successful you can login"
                        });
                        localStorage.clear();
                        this.router
                            .navigate(["/home"])
                            .catch((err) => log.info(err));
                    } else {
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Password Reset',
                            detail: 'Invalid otp verification code',
                        });
                    }
                });
        } else if (this.action === "registration") {
            this.authService.validateUpdateProfileOtp(data)
                .subscribe((response) => {
                    if (response) {
                        if (this.mixPanel) {
                            this.mixPanelService.track("OTP Sent", {
                                device: this.deviceDetectorService.device,
                                os: this.deviceDetectorService.os,
                                date: Date.now()
                            });
                        }
                        localStorage.clear();
                        const extras = {
                            code: this.code,
                            action: "registration"
                        };
                        localStorage.setItem("extras", JSON.stringify(extras));
                        this.router
                            .navigate(["/client/profile"])
                            .catch((err) => log.info(err));
                    }
                });
        } else if (this.action === "login") {
            const validateLogin: PasswordResetOtpValidation = {
                resetCode: rawData.otpValue,
                userType: this.userType,
                phoneNumber: this.mobileNo
            };
            this.authService.verifyPasswordResetRequest(validateLogin)
                .subscribe((response) => {
                    if (response) {
                        if (this.mixPanel) {
                            this.mixPanelService.track("Password Reset Request", {
                                device: this.deviceDetectorService.device,
                                os: this.deviceDetectorService.os,
                                date: Date.now()
                            });
                        }
                        const details = JSON.parse(localStorage.getItem("details"));
                        this.authService.attemptAuth(details);
                        localStorage.clear();
                    }
                });
        }
    }
}
