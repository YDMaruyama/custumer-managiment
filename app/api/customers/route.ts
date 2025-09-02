import { NextResponse } from 'next/server';
import { getAllCustomers, appendCustomer, updateCustomer, deleteCustomer, CustomerRecord } from '@/lib/googleSheet';

const sheetName = process.env.SHEETS_CUSTOMER_SHEET || 'Customers';

// GET: return all customers
export async function GET() {
  try {
    const customers = await getAllCustomers(sheetName);
    return NextResponse.json(customers);
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message || 'Failed to fetch customers', { status: 500 });
  }
}

// POST: create a new customer
export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Generate ID if not provided
    const id = body.id || crypto.randomUUID();
    const record: CustomerRecord = {
      id,
      name: body.name,
      kana: body.kana,
      phone: body.phone,
      email: body.email,
      birthDate: body.birthDate,
      gender: body.gender,
      address: body.address,
      firstVisitDate: body.firstVisitDate,
      lastVisitDate: body.lastVisitDate,
      visitCount: body.visitCount ? Number(body.visitCount) : undefined,
      tags: body.tags,
      allergy: body.allergy,
      history: body.history,
      consent: body.consent,
      note: body.note,
    };
    await appendCustomer(sheetName, record);
    return NextResponse.json(record, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message || 'Failed to create customer', { status: 500 });
  }
}

// PUT: update an existing customer
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const id = body.id;
    if (!id) return new NextResponse('id is required', { status: 400 });
    const data: Partial<CustomerRecord> = { ...body };
    delete data.id; // remove id from update
    await updateCustomer(sheetName, id, data);
    return NextResponse.json({ message: 'updated' });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message || 'Failed to update customer', { status: 500 });
  }
}

// DELETE: delete an existing customer
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return new NextResponse('id is required', { status: 400 });
    await deleteCustomer(sheetName, id);
    return NextResponse.json({ message: 'deleted' });
  } catch (err: any) {
    console.error(err);
    return new NextResponse(err.message || 'Failed to delete customer', { status: 500 });
  }
}