/*
  Warnings:

  - Added the required column `notasAuthTag` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notasInternasIv` to the `Order` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[Customer] ADD [direccionAuthTag] NVARCHAR(1000),
[direccionIv] NVARCHAR(1000),
[documentoAuthTag] NVARCHAR(1000),
[documentoIv] NVARCHAR(1000);

-- AlterTable
ALTER TABLE [dbo].[Order] ADD [notasAuthTag] NVARCHAR(1000) NOT NULL,
[notasInternasIv] NVARCHAR(1000) NOT NULL;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
