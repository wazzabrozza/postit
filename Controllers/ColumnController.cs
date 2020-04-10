using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Kaban_Whiteboard.Models;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Kaban_Whiteboard.Controllers
{
    [ApiController]

    [Route("api/column")]

    public class ColumnController : Controller
    {
        private readonly AppDbContext _context;

        public ColumnController(AppDbContext context)
        {
            _context = context;
        }
        // GET: api/<column>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Columns>>> GetColumn()
        {
            return await _context.Postit_Column.ToListAsync();
        }

        // GET api/<controller>/5
        [HttpGet("{Column_Id}")]
        public async Task<ActionResult<Columns>> GetColumn(int Column_Id)
        {
            var GetColumnNote = await _context.Postit_Column.FindAsync(Column_Id);

            if (GetColumnNote == null)
            {
                return NotFound();
            }

            return GetColumnNote;
        }

        // POST api/<controller>
        [HttpPost]
        public async Task<ActionResult<Columns>> InsertColumn(Columns col)
        {
            _context.Postit_Column.Add(col);
            await _context.SaveChangesAsync();

            return col; //CreatedAtAction(nameof(col), new { Id = col.Column_Id, }, col);
        }

        // PUT api/<controller>/5
        [HttpPut("{Column_Id}")]
        public async Task<IActionResult> UpdateColumn(int Column_Id, Columns col)
        {
            if (Column_Id != col.Column_Id)
            {
                return BadRequest();
            }

            _context.Entry(col).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Patch api/<controller>
        [HttpPatch("{Column_Id}")]
        public async Task<ActionResult> Patch(int Column_Id, [FromBody] JsonPatchDocument<Columns> patchDoc)
        {
            if (patchDoc == null)
            {
                return BadRequest();
            }

            var authorFromDB = await _context.Postit_Column.FirstOrDefaultAsync(x => x.Column_Id == Column_Id);

            if (authorFromDB == null)
            {
                return NotFound();
            }

            patchDoc.ApplyTo(authorFromDB, ModelState);

            var isValid = TryValidateModel(authorFromDB);

            if (!isValid)
            {
                return BadRequest(ModelState);
            }

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // DELETE api/<controller>/5
        [HttpDelete("{Column_Id}")]
        public async Task<ActionResult<Columns>> DeleteColumn(int Column_Id)
        {
            var GetColumn = await _context.Postit_Column.FindAsync(Column_Id);

            if (GetColumn == null)
            {
                return NotFound();
            }

            _context.Postit_Column.Remove(GetColumn);
            await _context.SaveChangesAsync();

            return GetColumn;
        }
    }
}