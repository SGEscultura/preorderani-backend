-- CreateTable
CREATE TABLE "roles" (
    "role_id" SERIAL NOT NULL,
    "role_name" VARCHAR(50) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("role_id")
);

-- CreateTable
CREATE TABLE "units" (
    "unit_id" SERIAL NOT NULL,
    "unit_code" VARCHAR(20) NOT NULL,
    "unit_label" VARCHAR(50) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("unit_id")
);

-- CreateTable
CREATE TABLE "crops" (
    "crop_id" SERIAL NOT NULL,
    "crop_name" VARCHAR(100) NOT NULL,
    "default_unit_id" INTEGER NOT NULL,

    CONSTRAINT "crops_pkey" PRIMARY KEY ("crop_id")
);

-- CreateTable
CREATE TABLE "harvest_statuses" (
    "harvest_status_id" SERIAL NOT NULL,
    "harvest_status_name" VARCHAR(30) NOT NULL,

    CONSTRAINT "harvest_statuses_pkey" PRIMARY KEY ("harvest_status_id")
);

-- CreateTable
CREATE TABLE "pre_order_statuses" (
    "pre_order_status_id" SERIAL NOT NULL,
    "pre_order_status_name" VARCHAR(30) NOT NULL,

    CONSTRAINT "pre_order_statuses_pkey" PRIMARY KEY ("pre_order_status_id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "payment_method_id" SERIAL NOT NULL,
    "payment_method_name" VARCHAR(30) NOT NULL,

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("payment_method_id")
);

-- CreateTable
CREATE TABLE "payment_statuses" (
    "payment_status_id" SERIAL NOT NULL,
    "payment_status_name" VARCHAR(30) NOT NULL,

    CONSTRAINT "payment_statuses_pkey" PRIMARY KEY ("payment_status_id")
);

-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "role_id" INTEGER NOT NULL,
    "user_name" VARCHAR(150) NOT NULL,
    "user_email" VARCHAR(150) NOT NULL,
    "user_password" VARCHAR(255) NOT NULL,
    "user_phone" VARCHAR(20),
    "user_location" VARCHAR(150),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "harvests" (
    "harvest_id" SERIAL NOT NULL,
    "farmer_id" INTEGER NOT NULL,
    "crop_id" INTEGER NOT NULL,
    "unit_id" INTEGER NOT NULL,
    "harvest_status_id" INTEGER NOT NULL,
    "harvest_quantity" DECIMAL(10,2) NOT NULL,
    "harvest_price_per_unit" DECIMAL(10,2) NOT NULL,
    "harvest_date" DATE NOT NULL,
    "harvest_location" VARCHAR(150) NOT NULL,
    "harvest_description" TEXT,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "harvests_pkey" PRIMARY KEY ("harvest_id")
);

-- CreateTable
CREATE TABLE "pre_orders" (
    "pre_order_id" SERIAL NOT NULL,
    "harvest_id" INTEGER NOT NULL,
    "consumer_id" INTEGER NOT NULL,
    "pre_order_status_id" INTEGER NOT NULL,
    "pre_order_quantity" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pre_orders_pkey" PRIMARY KEY ("pre_order_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "payment_id" SERIAL NOT NULL,
    "pre_order_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "payment_status_id" INTEGER NOT NULL,
    "payment_amount" DECIMAL(10,2) NOT NULL,
    "payment_reference" VARCHAR(100),
    "paid_at" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "invoice_id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "invoice_number" VARCHAR(30) NOT NULL,
    "issued_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("invoice_id")
);

-- CreateTable
CREATE TABLE "payment_logs" (
    "payment_log_id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "payment_status_id" INTEGER NOT NULL,
    "changed_by" INTEGER NOT NULL,
    "log_note" VARCHAR(255),
    "logged_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_logs_pkey" PRIMARY KEY ("payment_log_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_role_name_key" ON "roles"("role_name");

-- CreateIndex
CREATE UNIQUE INDEX "units_unit_code_key" ON "units"("unit_code");

-- CreateIndex
CREATE UNIQUE INDEX "crops_crop_name_key" ON "crops"("crop_name");

-- CreateIndex
CREATE UNIQUE INDEX "harvest_statuses_harvest_status_name_key" ON "harvest_statuses"("harvest_status_name");

-- CreateIndex
CREATE UNIQUE INDEX "pre_order_statuses_pre_order_status_name_key" ON "pre_order_statuses"("pre_order_status_name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_methods_payment_method_name_key" ON "payment_methods"("payment_method_name");

-- CreateIndex
CREATE UNIQUE INDEX "payment_statuses_payment_status_name_key" ON "payment_statuses"("payment_status_name");

-- CreateIndex
CREATE UNIQUE INDEX "users_user_email_key" ON "users"("user_email");

-- CreateIndex
CREATE UNIQUE INDEX "payments_pre_order_id_key" ON "payments"("pre_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_payment_id_key" ON "invoices"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_invoice_number_key" ON "invoices"("invoice_number");

-- AddForeignKey
ALTER TABLE "crops" ADD CONSTRAINT "crops_default_unit_id_fkey" FOREIGN KEY ("default_unit_id") REFERENCES "units"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("role_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_farmer_id_fkey" FOREIGN KEY ("farmer_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_crop_id_fkey" FOREIGN KEY ("crop_id") REFERENCES "crops"("crop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("unit_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "harvests" ADD CONSTRAINT "harvests_harvest_status_id_fkey" FOREIGN KEY ("harvest_status_id") REFERENCES "harvest_statuses"("harvest_status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_orders" ADD CONSTRAINT "pre_orders_harvest_id_fkey" FOREIGN KEY ("harvest_id") REFERENCES "harvests"("harvest_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_orders" ADD CONSTRAINT "pre_orders_consumer_id_fkey" FOREIGN KEY ("consumer_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pre_orders" ADD CONSTRAINT "pre_orders_pre_order_status_id_fkey" FOREIGN KEY ("pre_order_status_id") REFERENCES "pre_order_statuses"("pre_order_status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_pre_order_id_fkey" FOREIGN KEY ("pre_order_id") REFERENCES "pre_orders"("pre_order_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("payment_method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_status_id_fkey" FOREIGN KEY ("payment_status_id") REFERENCES "payment_statuses"("payment_status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("payment_method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_payment_status_id_fkey" FOREIGN KEY ("payment_status_id") REFERENCES "payment_statuses"("payment_status_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_logs" ADD CONSTRAINT "payment_logs_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "harvests"   ADD CONSTRAINT "harvests_quantity_check"   CHECK ("harvest_quantity" > 0);
ALTER TABLE "harvests"   ADD CONSTRAINT "harvests_price_check"      CHECK ("harvest_price_per_unit" >= 0);
ALTER TABLE "pre_orders" ADD CONSTRAINT "pre_orders_quantity_check" CHECK ("pre_order_quantity" > 0);
ALTER TABLE "payments"   ADD CONSTRAINT "payments_amount_check"     CHECK ("payment_amount" > 0);