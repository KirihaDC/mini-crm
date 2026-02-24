/*
  Warnings:

  - You are about to alter the column `notasAuthTag` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(255)`.
  - You are about to alter the column `notasIv` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `NVarChar(1000)` to `VarChar(255)`.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Order] ALTER COLUMN [notasAuthTag] VARCHAR(255) NOT NULL;
ALTER TABLE [dbo].[Order] ALTER COLUMN [notasIv] VARCHAR(255) NOT NULL;
ALTER TABLE [dbo].[Order] ADD CONSTRAINT [Order_notasAuthTag_df] DEFAULT '' FOR [notasAuthTag], CONSTRAINT [Order_notasIv_df] DEFAULT '' FOR [notasIv];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
