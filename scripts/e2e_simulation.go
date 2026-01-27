package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"
)

// Config
const (
	BaseURL = "http://localhost:8080"
)

var authToken string

// Helper to make requests
func request(method, url string, body interface{}, dest interface{}) error {
	var bodyReader io.Reader
	if body != nil {
		jsonBytes, _ := json.Marshal(body)
		bodyReader = bytes.NewBuffer(jsonBytes)
	}

	req, err := http.NewRequest(method, BaseURL+url, bodyReader)
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if authToken != "" {
		req.Header.Set("Authorization", "Bearer "+authToken)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		b, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("API Error %d: %s", resp.StatusCode, string(b))
	}

	if dest != nil {
		return json.NewDecoder(resp.Body).Decode(dest)
	}
	return nil
}

func main() {
	fmt.Println("🚀 Starting Payment Ecosystem E2E Simulation...")

	// 0. Auth: Register and Login
	fmt.Print("\n0️⃣  Authenticating... ")
	email := fmt.Sprintf("e2e_user_%d@example.com", time.Now().Unix())
	password := "password123"

	// Register
	regReq := map[string]interface{}{
		"email":     email,
		"password":  password,
		"full_name": "E2E User",
	}
	request("POST", "/auth/register", regReq, nil)

	// Login
	loginReq := map[string]interface{}{
		"email":    email,
		"password": password,
	}
	var loginResp map[string]interface{}
	if err := request("POST", "/auth/login", loginReq, &loginResp); err != nil {
		fmt.Printf("FAILED to Login: %v\n", err)
		os.Exit(1)
	}
	authToken = loginResp["access_token"].(string)
	fmt.Printf("✅ Authenticated as %s\n", email)

	// 1. Create a Plan
	fmt.Print("\n1️⃣  Creating Pricing Plan... ")
	planReq := map[string]interface{}{
		"name":        "E2E Test Plan",
		"description": "Verification Run",
		"type":        "one_time",
		"one_time_config": map[string]interface{}{
			"price":    100.0,
			"currency": "USD",
		},
	}
	var planResp map[string]interface{}
	if err := request("POST", "/pricing/plans", planReq, &planResp); err != nil {
		fmt.Printf("FAILED: %v\n", err)
		os.Exit(1)
	}
	planID := planResp["id"].(string)
	fmt.Printf("✅ Created Plan: %s\n", planID)

	// 2. Affiliate: Join Program (Generate Link)
	fmt.Print("\n2️⃣  Generating Affiliate Link... ")
	// Assuming Program exists or we create one. Let's create one first to be safe (dev endpoint)
	programReq := map[string]interface{}{"rate": 20.0} // 20%
	var progResp map[string]interface{}
	if err := request("POST", "/affiliate/programs", programReq, &progResp); err != nil {
		fmt.Printf("FAILED: %v\n", err)
		os.Exit(1)
	}
	programID := progResp["id"].(string)
	fmt.Printf("✅ Created Program: %s\n", programID)

	affiliateCode := fmt.Sprintf("TEST%d", time.Now().Unix())
	linkReq := map[string]interface{}{
		"program_id": programID,
		"code":       affiliateCode,
	}
	var linkResp map[string]interface{}
	if err := request("POST", "/affiliate/links", linkReq, &linkResp); err != nil {
		fmt.Printf("FAILED: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("✅ Generated Code: %s\n", affiliateCode)

	// 3. Buyer: Checkout with Code
	fmt.Print("\n3️⃣  Initiating Checkout... ")
	checkoutReq := map[string]interface{}{
		"plan_id":        planID,
		"affiliate_code": affiliateCode,
	}
	var checkoutResp map[string]interface{}
	if err := request("POST", "/payment/checkout", checkoutReq, &checkoutResp); err != nil {
		fmt.Printf("FAILED: %v\n", err)
		os.Exit(1)
	}
	fmt.Printf("✅ Payment Intent Created (Secret Previews: %s)\n", checkoutResp["client_secret"])

	// 4. Simulate Payment Success (Webhook)
	fmt.Print("\n4️⃣  Simulating Payment Success... ")
	webhookReq := map[string]interface{}{
		"amount":   100.0,
		"currency": "USD",
		"metadata": map[string]string{
			"plan_id":        planID,
			"user_id":        "mock_buyer",
			"affiliate_code": affiliateCode,
		},
	}
	if err := request("POST", "/payment/webhook/mock", webhookReq, nil); err != nil {
		fmt.Printf("FAILED: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Webhook Processed")

	// 5. Verify Commission (Wallet Balance)
	fmt.Print("\n5️⃣  Verifying Affiliate Wallet... ")
	var walletResp map[string]interface{}
	if err := request("GET", "/wallet/balance", nil, &walletResp); err != nil {
		fmt.Printf("FAILED: %v\n", err)
		os.Exit(1)
	}
	balance := walletResp["balance"].(float64)
	fmt.Printf("✅ Wallet Balance: $%.2f (Expected >= $20.00)\n", balance)

	if balance < 20.0 {
		fmt.Println("❌ Error: Commission not applied!")
		os.Exit(1)
	}

	// 6. Request Payout
	fmt.Print("\n6️⃣  Requesting Payout... ")
	payoutReq := map[string]interface{}{
		"amount": 20.0,
		"method": "stripe",
	}
	if err := request("POST", "/wallet/payouts", payoutReq, nil); err != nil {
		fmt.Printf("FAILED: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Payout Requested")

	// 7. Generate Invoice
	fmt.Print("\n7️⃣  Generating Invoice... ")
	var invResp map[string]interface{}
	if err := request("POST", "/invoices/generate/mock_tx_id", nil, &invResp); err != nil {
		fmt.Printf("FAILED: %v\n", err)
		os.Exit(1)
	}
	invID := invResp["id"].(string)
	fmt.Printf("✅ Invoice Created: %s\n", invID)

	// 8. Download Invoice
	fmt.Print("\n8️⃣  Downloading Invoice... ")
	// Just check if endpoint 200s
	// Use Helper to get headers
	req, _ := http.NewRequest("GET", BaseURL+"/invoices/"+invID+"/download", nil)
	req.Header.Set("Authorization", "Bearer "+authToken)
	resp, err := (&http.Client{}).Do(req)

	if err != nil || resp.StatusCode != 200 {
		fmt.Printf("FAILED: %v\n", err)
		os.Exit(1)
	}
	fmt.Println("✅ Invoice Downloaded")

	fmt.Println("\n✨ E2E VERIFICATION SUCCESSFUL! ✨")
}
